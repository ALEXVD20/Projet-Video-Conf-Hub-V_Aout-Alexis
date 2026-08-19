import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recupererStatistiquesChaine } from '../services/apiYoutube';
import { formaterNombre } from '../services/formatteur';

const Accueil = () => {
  const naviguer = useNavigate();
  const [listeChaines, modifierListeChaines] = useState([]);
  const [chargement, modifierChargement] = useState(true);

  useEffect(() => {
    const chargerChaines = async () => {
      try {
        const identifiantsChaines = JSON.parse(import.meta.env.VITE_CHANNELS_ID || '[]');
        const requetes = identifiantsChaines.map(chaine => recupererStatistiquesChaine(chaine.id));
        const resultats = await Promise.all(requetes);
        modifierListeChaines(resultats.filter(Boolean));
      } catch (erreur) {
        console.error(erreur);
      } finally {
        modifierChargement(false);
      }
    };
    chargerChaines();
  }, []);

  if (chargement) {
    return <div className="pt-28 text-center text-gray-400">Chargement des chaînes...</div>;
  }

  return (
      <div className="pt-28 max-w-7xl mx-auto px-6 pb-12">
        <h1 className="text-3xl font-bold text-white mb-8">Chaînes de Conférences</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listeChaines.map((chaine) => (
              <div
                  key={chaine.id}
                  onClick={() => naviguer(`/chaine/${chaine.id}`)}
                  className="bg-[#12161f] border border-[#232a3b] hover:border-[#3b82f6] rounded-2xl p-6 shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <img
                    src={chaine.snippet?.thumbnails?.high?.url || chaine.snippet?.thumbnails?.medium?.url || chaine.snippet?.thumbnails?.default?.url}
                    alt={chaine.snippet?.title}
                    referrerPolicy="no-referrer"
                    style={{ width: '120px', height: '120px', maxWidth: '120px', maxHeight: '120px' }}
                    className="rounded-full object-cover mb-4 border-2 border-[#232a3b] group-hover:border-blue-500 transition-colors flex-shrink-0"
                />
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {chaine.snippet?.title}
                </h2>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {chaine.snippet?.description}
                </p>
                <div className="mt-auto border-t border-[#232a3b] w-full pt-4 text-xs text-gray-400 font-medium">
                  Abonnés : <span className="text-blue-400 font-semibold">{formaterNombre(chaine.statistics?.subscriberCount)}</span>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default Accueil;