import { useEffect, useState } from 'react';
import { recupererDetailsVideo } from '../services/apiYoutube.js';
import GrilleVideos from '../composants/GrilleVideos';

const Historique = () => {
  const [videosHistorique, modifierVideosHistorique] = useState([]);
  const [chargement, modifierChargement] = useState(true);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('historique_videos') || '[]');
    if (list.length === 0) { modifierChargement(false); return; }
    Promise.all(list.map(id => recupererDetailsVideo(id)))
        .then(res => modifierVideosHistorique(res.filter(Boolean)))
        .catch(console.error)
        .finally(() => modifierChargement(false));
  }, []);

  const purgerHistorique = () => {
    localStorage.removeItem('historique_videos');
    modifierVideosHistorique([]);
  };

  if (chargement) return <div className="pt-28 text-center text-gray-400">Chargement...</div>;

  return (
      <div className="pt-28 max-w-7xl mx-auto px-6 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Historique de visionnage</h1>
          {videosHistorique.length > 0 && (
              <button
                  onClick={purgerHistorique}
                  className="text-xs px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
              >
                Effacer tout
              </button>
          )}
        </div>
        {videosHistorique.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-[#12161f] border border-[#232a3b] rounded-2xl">
              Aucun historique.
            </div>
        ) : (
            <GrilleVideos listeVideos={videosHistorique} />
        )}
      </div>
  );
};

export default Historique;