import axios from 'axios';

const cleApi = import.meta.env.VITE_YOUTUBE_API_KEY;

const instanceAxios = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: { key: cleApi },
});

// Cache dans le sessionStorage avec expiration (1 heure par défaut)
const fetchAvecCache = async (url, config, ttlMinutes = 60) => {
    const cacheKey = `yt_cache_${url}_${JSON.stringify(config.params)}`;
    const itemCache = sessionStorage.getItem(cacheKey);

    if (itemCache) {
        const { data, timestamp } = JSON.parse(itemCache);
        // Vérifie si le cache est toujours valide
        if (Date.now() - timestamp < ttlMinutes * 60 * 1000) {
            return data;
        }
    }

    const response = await instanceAxios.get(url, config);

    // Sauvegarde dans le sessionStorage
    try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
            data: response.data,
            timestamp: Date.now(),
        }));
    } catch (e) {
        // Si le storage est plein, on ignore l'erreur
    }

    return response.data;
};

// 1. Statistique de la chaîne
export const recupererStatistiquesChaine = async (id) => {
    const response = await fetchAvecCache('/channels', {
        params: {
            part: 'snippet,statistics,contentDetails',
            id,
            fields: 'items(id,snippet(title,description,thumbnails),statistics(subscriberCount),contentDetails/relatedPlaylists/uploads)',
        },
    });
    return response.items?.[0];
};

// 2. Récupérer les playlists d'une chaîne
export const recupererPlaylistsChaine = async (channelId) => {
    const response = await fetchAvecCache('/playlists', {
        params: {
            part: 'snippet,contentDetails',
            channelId,
            maxResults: 10,
            fields: 'items(id,snippet(title,description,thumbnails),contentDetails/itemCount)',
        },
    });
    return response.items;
};

// 3. Récupérer TOUTES les vidéos d'une playlist
export const recupererVideosPlaylist = async (playlistId) => {
    let toutesLesVideos = [];
    let pageToken = '';

    do {
        const response = await fetchAvecCache('/playlistItems', {
            params: {
                part: 'snippet,contentDetails',
                playlistId,
                maxResults: 50,
                pageToken,
                fields: 'nextPageToken,items(id,snippet(title,description,thumbnails,publishedAt,channelTitle,resourceId/videoId))',
            },
        });

        if (response.items) {
            toutesLesVideos = [...toutesLesVideos, ...response.items];
        }
        pageToken = response.nextPageToken;
    } while (pageToken);

    return toutesLesVideos;
};

// 4. Détails d'une ou plusieurs vidéos (Accepte ID unique ou Tableau d'IDs)
export const recupererDetailsVideo = async (id) => {
    if (!id || (Array.isArray(id) && id.length === 0)) return null;
    const idsStr = Array.isArray(id) ? id.join(',') : id;

    const response = await fetchAvecCache('/videos', {
        params: {
            part: 'snippet,contentDetails,statistics',
            id: idsStr,
            fields: 'items(id,snippet(title,description,thumbnails,publishedAt),contentDetails/duration,statistics(viewCount))',
        },
    });

    return Array.isArray(id) ? response.items : response.items?.[0];
};

// 5. Recherche optimisée : Filtre les vidéos de la chaîne via sa playlist Uploads au lieu de /search
export const rechercherVideosChaine = async (channelId, q) => {
    if (!q || !q.trim()) return [];

    // A. On récupère la chaîne pour avoir l'ID de sa playlist "uploads" (1 unité au lieu de 100)
    const chaine = await recupererStatistiquesChaine(channelId);
    const uploadsPlaylistId = chaine?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) return [];

    // B. On récupère les vidéos récentes de la chaîne (1 unité)
    const videos = await recupererVideosPlaylist(uploadsPlaylistId);

    // C. Filtrage côté client (recherche par titre/description)
    const termeRecherche = q.toLowerCase();
    return videos.filter((item) => {
        const titre = item.snippet?.title?.toLowerCase() || '';
        const desc = item.snippet?.description?.toLowerCase() || '';
        return titre.includes(termeRecherche) || desc.includes(termeRecherche);
    });
};
