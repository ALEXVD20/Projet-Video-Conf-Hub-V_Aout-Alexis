import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recupererDetailsVideo } from '../services/apiYoutube.js';
import { formaterNombre, formaterDate } from '../services/formatteur.js';

const LectureVideo = () => {
  const { identifiantVideo } = useParams();
  const naviguer = useNavigate();
  const [donneesVideo, modifierDonneesVideo] = useState(null);
  const [chargement, modifierChargement] = useState(true);
  const [estDansLaListe, modifierEstDansLaListe] = useState(false);
  const [notes, modifierNotes] = useState('');

  useEffect(() => {
    recupererDetailsVideo(identifiantVideo).then(d => {
      modifierDonneesVideo(d);

      const historique = JSON.parse(localStorage.getItem('historique_videos') || '[]');
      if (!historique.includes(identifiantVideo)) {
        historique.unshift(identifiantVideo);
        localStorage.setItem('historique_videos', JSON.stringify(historique));
      }

      const liste = JSON.parse(localStorage.getItem('videos_a_voir') || '[]');
      modifierEstDansLaListe(liste.includes(identifiantVideo));
      const dictNotes = JSON.parse(localStorage.getItem('notes_videos') || '{}');
      modifierNotes(dictNotes[identifiantVideo] || '');
    }).catch(console.error).finally(() => modifierChargement(false));
  }, [identifiantVideo]);

  const inverserStatutListe = () => {
    let liste = JSON.parse(localStorage.getItem('videos_a_voir') || '[]');
    if (estDansLaListe) { liste = liste.filter(id => id !== identifiantVideo); }
    else { liste.push(identifiantVideo); }
    localStorage.setItem('videos_a_voir', JSON.stringify(liste));
    modifierEstDansLaListe(!estDansLaListe);
  };

  const sauvegarderNotes = (e) => {
    e.preventDefault();
    const dictNotes = JSON.parse(localStorage.getItem('notes_videos') || '{}');
    if (notes.trim() === '') { delete dictNotes[identifiantVideo]; }
    else { dictNotes[identifiantVideo] = notes; }
    localStorage.setItem('notes_videos', JSON.stringify(dictNotes));
  };

  const supprimerNotes = () => {
    const dictNotes = JSON.parse(localStorage.getItem('notes_videos') || '{}');
    delete dictNotes[identifiantVideo];
    localStorage.setItem('notes_videos', JSON.stringify(dictNotes));
    modifierNotes('');
  };

  if (chargement) return <div className="pt-28 text-center text-gray-400">Chargement...</div>;
  if (!donneesVideo) return <div className="pt-28 text-center text-gray-400">Vidéo introuvable.</div>;

  return (
      <div className="pt-28 max-w-5xl mx-auto px-6 pb-12">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => naviguer(-1)} className="text-blue-400 hover:text-blue-300 font-medium">
            ← Retour
          </button>
          <button
              onClick={inverserStatutListe}
              className={`px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
                  estDansLaListe
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
              }`}
          >
            {estDansLaListe ? 'Retirer des éléments à voir' : 'Ajouter à voir plus tard'}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">{donneesVideo.snippet.title}</h1>
        <p className="text-xs font-medium text-gray-400 mb-6">
          Vues : {formaterNombre(donneesVideo.statistics.viewCount)} • {formaterDate(donneesVideo.snippet.publishedAt)}
        </p>

        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#232a3b] mb-8 bg-[#0a0c10]">
          <iframe
              src={`https://www.youtube.com/embed/${identifiantVideo}`}
              className="w-full h-full"
              allowFullScreen
              title={donneesVideo.snippet.title}
          ></iframe>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#12161f] border border-[#232a3b] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">Description</h2>
            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{donneesVideo.snippet.description}</p>
          </div>

          <div className="bg-[#12161f] border border-[#232a3b] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Notes personnelles</h2>
            <form onSubmit={sauvegarderNotes}>
            <textarea
                value={notes}
                onChange={(e) => modifierNotes(e.target.value)}
                placeholder="Saisissez vos notes ici..."
                className="w-full h-40 bg-[#0a0c10] border border-[#232a3b] focus:border-blue-500 text-gray-200 rounded-xl p-3 text-sm mb-4 resize-none outline-none"
            ></textarea>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs py-2.5 transition-colors">
                  Sauvegarder
                </button>
                {notes.trim() !== '' && (
                    <button
                        type="button"
                        onClick={supprimerNotes}
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-xs py-2.5 px-3 transition-colors"
                    >
                      Supprimer
                    </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default LectureVideo;