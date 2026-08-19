import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recupererStatistiquesChaine, recupererVideosPlaylist } from '../services/ApiYoutube.js';
import { formaterNombre } from '../services/Formatteur.js';
import GrilleVideos from '../composants/GrilleVideos.jsx';

const IMAGE_PAR_DEFAUT = "https://via.placeholder.com/150/12161f/ffffff?text=Logo";

const DetailChaine = () => {
  const { identifiantChaine } = useParams();
  const naviguer = useNavigate();

  const [infosChaine, modifierInfosChaine] = useState(null);
  const [videosFiltrees, modifierVideosFiltrees] = useState([]);
  const [chargement, modifierChargement] = useState(true);

  const [groupedVideos, setGroupedVideos] = useState({});
  const [anneesDisponibles, modifierAnneesDisponibles] = useState([]);
  const [anneeSelectionnee, modifierAnneeSelectionnee] = useState('');

  const [limiteAffichage, setLimiteAffichage] = useState(50);

  const grouperParChaineEtAnnee = (listeVideos, nomOfficielChaine) => {
    return listeVideos.reduce((acc, video) => {
      if (!video.snippet) return acc;

      const annee = new Date(video.snippet.publishedAt).getFullYear().toString();
      const chaine = nomOfficielChaine || video.snippet?.channelTitle || "Chaîne Inconnue";
      const cle = `${chaine} ${annee}`;

      if (!acc[cle]) {
        acc[cle] = {
          label: `${chaine} ${annee}`,
          videos: []
        };
      }

      acc[cle].videos.push(video);
      return acc;
    }, {});
  };

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const donneesChaine = await recupererStatistiquesChaine(identifiantChaine);
        modifierInfosChaine(donneesChaine);

        const nomChaine = donneesChaine?.snippet?.title;
        const idPlaylistUploads = donneesChaine?.contentDetails?.relatedPlaylists?.uploads;

        if (idPlaylistUploads) {
          const listeVideos = await recupererVideosPlaylist(idPlaylistUploads);
          const structuresGroupees = grouperParChaineEtAnnee(listeVideos, nomChaine);

          setGroupedVideos(structuresGroupees);

          const listeUI = Object.keys(structuresGroupees)
              .map((cle) => ({
                cle,
                label: `${structuresGroupees[cle].label} (${structuresGroupees[cle].videos.length})`
              }))
              .sort((a, b) => b.cle.localeCompare(a.cle));

          modifierAnneesDisponibles(listeUI);

          if (listeUI.length > 0) {
            modifierAnneeSelectionnee(listeUI[0].cle);
          }
        }
      } catch (erreur) {
        console.error("Erreur lors du chargement de la chaîne :", erreur);
      } finally {
        modifierChargement(false);
      }
    };

    chargerDonnees();
  }, [identifiantChaine]);

  useEffect(() => {
    if (!anneeSelectionnee) {
      modifierVideosFiltrees([]);
      return;
    }
    setLimiteAffichage(50);
  }, [anneeSelectionnee]);

  useEffect(() => {
    if (!anneeSelectionnee) return;
    const totalDuGroupe = groupedVideos[anneeSelectionnee]?.videos ?? [];
    modifierVideosFiltrees(totalDuGroupe.slice(0, limiteAffichage));
  }, [anneeSelectionnee, groupedVideos, limiteAffichage]);

  const totalVideosDuGroupe = groupedVideos[anneeSelectionnee]?.videos?.length || 0;
  const resteDesVideos = totalVideosDuGroupe > videosFiltrees.length;

  if (chargement) {
    return <div className="pt-28 text-center text-gray-400">Chargement de la chaîne...</div>;
  }

  return (
      <div className="pt-28 max-w-7xl mx-auto px-6 pb-12">
        <button
            type="button"
            onClick={() => naviguer('/')}
            className="mb-6 text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center bg-transparent border-0 cursor-pointer"
        >
          ← Retour à l'accueil
        </button>

        {infosChaine && (
            <div className="bg-[#12161f] border border-[#232a3b] rounded-2xl p-6 shadow-lg mb-8 flex flex-col md:flex-row items-center gap-6">
              <img
                  src={
                      infosChaine.snippet?.thumbnails?.high?.url ||
                      infosChaine.snippet?.thumbnails?.medium?.url ||
                      infosChaine.snippet?.thumbnails?.default?.url ||
                      IMAGE_PAR_DEFAUT
                  }
                  alt={infosChaine.snippet?.title || "Logo chaîne"}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = IMAGE_PAR_DEFAUT;
                  }}
                  style={{ width: '120px', height: '120px', maxWidth: '120px', maxHeight: '120px' }}
                  className="rounded-full object-cover border-2 border-[#232a3b] flex-shrink-0"
              />
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-white mb-2">{infosChaine.snippet?.title}</h1>
                <p className="text-gray-400 text-sm max-w-3xl mb-2">{infosChaine.snippet?.description}</p>
                <p className="text-xs font-semibold text-blue-400">
                  Abonnés : {formaterNombre(infosChaine.statistics?.subscriberCount)}
                </p>
              </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider px-1">
              Sélectionner une année
            </h2>
            <div className="flex flex-col gap-2">
              {anneesDisponibles.map((item) => {
                const estActif = anneeSelectionnee === item.cle;
                return (
                    <button
                        key={item.cle}
                        type="button"
                        onClick={() => modifierAnneeSelectionnee(item.cle)}
                        className={`text-left w-full cursor-pointer transition-all border rounded-xl p-3 ${
                            estActif
                                ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-semibold'
                                : 'bg-[#12161f] border-[#232a3b] text-gray-300 hover:border-gray-500'
                        }`}
                    >
                      <span className="text-sm">{item.label}</span>
                    </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-3">
            {!anneeSelectionnee && (
                <p className="text-center text-gray-400 py-6">Sélectionnez une année à gauche</p>
            )}
            {anneeSelectionnee && (
                <>
                  {/* Grille forcée strictement à 2 colonnes via la prop */}
                  <GrilleVideos
                      listeVideos={videosFiltrees}
                      colonnes="grid-cols-1 sm:grid-cols-2"
                  />

                  {resteDesVideos && (
                      <div className="flex justify-center mt-8">
                        <button
                            type="button"
                            onClick={() => setLimiteAffichage((prev) => prev + 50)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                        >
                          Afficher la suite (+50)
                        </button>
                      </div>
                  )}
                </>
            )}
          </div>
        </div>
      </div>
  );
};

export default DetailChaine;