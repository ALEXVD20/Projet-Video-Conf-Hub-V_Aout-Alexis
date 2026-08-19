import { useEffect, useState } from 'react';
import { recupererDetailsVideo } from '../services/ApiYoutube.js';
import GrilleVideos from '../composants/GrilleVideos.jsx';

const AVoirPlusTard = () => {
  const [videosEnregistrees, modifierVideosEnregistrees] = useState([]);
  const [chargement, modifierChargement] = useState(true);

  useEffect(() => {
    const liste = JSON.parse(localStorage.getItem('videos_a_voir') || '[]');
    if (liste.length === 0) { modifierChargement(false); return; }
    Promise.all(liste.map(id => recupererDetailsVideo(id)))
        .then(res => modifierVideosEnregistrees(res.filter(Boolean)))
        .catch(console.error)
        .finally(() => modifierChargement(false));
  }, []);

  if (chargement) return <div className="pt-28 text-center text-gray-400">Chargement de votre liste...</div>;

  return (
      <div className="pt-28 max-w-7xl mx-auto px-6 pb-12">
        <h1 className="text-2xl font-bold text-white mb-6">À voir plus tard</h1>
        {videosEnregistrees.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-[#12161f] border border-[#232a3b] rounded-2xl">
              Aucune vidéo enregistrée.
            </div>
        ) : (
            <GrilleVideos listeVideos={videosEnregistrees} />
        )}
      </div>
  );
};

export default AVoirPlusTard;