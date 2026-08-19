import axios from 'axios';

const cleApi = import.meta.env.VITE_YOUTUBE_API_KEY;

const instanceAxios = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: { key: cleApi },
});

const executerAvecCache = async (cleCache, fonctionRequete, dureeVieMinutes = 30) => {
    const donneeMiseEnCache = sessionStorage.getItem(cleCache);

    if (donneeMiseEnCache) {
        const { donnees, horodatage } = JSON.parse(donneeMiseEnCache);
        if (Date.now() - horodatage < dureeVieMinutes * 60 * 1000) {
            return donnees;
        }
    }

    const resultats = await fonctionRequete();

    try {
        sessionStorage.setItem(
            cleCache,
            JSON.stringify({ donnees: resultats, horodatage: Date.now() })
        );
    } catch (erreur) {
    }

    return resultats;
};

export const recupererStatistiquesChaine = async (identifiantChaine) => {
    const identifiants = Array.isArray(identifiantChaine)
        ? identifiantChaine.join(',')
        : identifiantChaine;

    return executerAvecCache(`chaine_${identifiants}`, async () => {
        const reponse = await instanceAxios.get('/channels', {
            params: {
                part: 'snippet,statistics,contentDetails',
                id: identifiants,
                fields:
                    'items(id,snippet(title,description,thumbnails),statistics(subscriberCount,videoCount),contentDetails/relatedPlaylists/uploads)',
            },
        });

        return Array.isArray(identifiantChaine)
            ? reponse.data.items
            : reponse.data.items?.[0];
    });
};

export const recupererPlaylistsChaine = async (identifiantChaine, limiteResultats = 50) => {
    return executerAvecCache(`playlists_${identifiantChaine}`, async () => {
        const reponse = await instanceAxios.get('/playlists', {
            params: {
                part: 'snippet,contentDetails',
                channelId: identifiantChaine,
                maxResults: limiteResultats,
                fields:
                    'items(id,snippet(title,description,thumbnails),contentDetails/itemCount)',
            },
        });

        return reponse.data.items || [];
    });
};

export const recupererVideosPlaylist = async (identifiantPlaylist, maxPages = 1) => {
    return executerAvecCache(`videos_playlist_${identifiantPlaylist}`, async () => {
        let toutesLesVideos = [];
        let jetonPage = undefined;
        let compteurPages = 0;

        do {
            const reponse = await instanceAxios.get('/playlistItems', {
                params: {
                    part: 'snippet,contentDetails',
                    playlistId: identifiantPlaylist,
                    maxResults: 50,
                    ...(jetonPage && { pageToken: jetonPage }),
                    fields:
                        'nextPageToken,items(id,snippet(title,description,thumbnails,publishedAt,resourceId/videoId))',
                },
            });

            if (reponse.data.items) {
                toutesLesVideos.push(...reponse.data.items);
            }

            jetonPage = reponse.data.nextPageToken;
            compteurPages++;
        } while (jetonPage && compteurPages < maxPages);

        return toutesLesVideos;
    });
};

export const recupererDetailsVideo = async (identifiantVideo) => {
    if (!identifiantVideo || (Array.isArray(identifiantVideo) && identifiantVideo.length === 0)) {
        return null;
    }

    const identifiantsTexte = Array.isArray(identifiantVideo)
        ? identifiantVideo.join(',')
        : identifiantVideo;

    return executerAvecCache(`details_video_${identifiantsTexte}`, async () => {
        const reponse = await instanceAxios.get('/videos', {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: identifiantsTexte,
                fields:
                    'items(id,snippet(title,description,thumbnails,publishedAt),contentDetails/duration,statistics(viewCount,likeCount))',
            },
        });

        return Array.isArray(identifiantVideo)
            ? reponse.data.items
            : reponse.data.items?.[0];
    });
};

export const rechercherVideosChaine = async (identifiantChaine, termeRecherche) => {
    if (!termeRecherche || !termeRecherche.trim()) return [];

    const chaine = await recupererStatistiquesChaine(identifiantChaine);
    const identifiantPlaylistUploads = chaine?.contentDetails?.relatedPlaylists?.uploads;

    if (!identifiantPlaylistUploads) return [];

    const videos = await recupererVideosPlaylist(identifiantPlaylistUploads, 2);

    const rechercheMinusc = termeRecherche.toLowerCase();
    return videos.filter((element) => {
        const titre = element.snippet?.title?.toLowerCase() || '';
        const description = element.snippet?.description?.toLowerCase() || '';
        return titre.includes(rechercheMinusc) || description.includes(rechercheMinusc);
    });
};