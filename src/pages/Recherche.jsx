import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rechercherVideosChaine } from '../services/ApiYoutube.js';

const Recherche = () => {
    const naviguer = useNavigate();
    const [chainesDisponibles] = useState(() => JSON.parse(import.meta.env.VITE_CHANNELS_ID || '[]'));
    const [chaineSelectionnee, modifierChaineSelectionnee] = useState('');
    const [termeRecherche, modifierTermeRecherche] = useState('');
    const [resultats, modifierResultats] = useState([]);
    const [chargement, modifierChargement] = useState(false);

    const executerRecherche = async (e) => {
        e.preventDefault();
        if (!chaineSelectionnee || !termeRecherche.trim()) return;
        modifierChargement(true);
        try {
            const d = await rechercherVideosChaine(chaineSelectionnee, termeRecherche);
            modifierResultats(d);
        } catch (err) {
            console.error(err);
        } finally {
            modifierChargement(false);
        }
    };

    return (
        <div className="pt-28 max-w-7xl mx-auto px-6 pb-12">
            <h1 className="text-2xl font-bold text-white mb-6">Rechercher des vidéos</h1>
            <form
                onSubmit={executerRecherche}
                className="bg-[#12161f] p-6 rounded-2xl border border-[#232a3b] flex flex-col md:flex-row gap-4 items-end mb-8 shadow-xl"
            >
                <div className="w-full">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Chaîne</label>
                    <select
                        value={chaineSelectionnee}
                        onChange={(e) => modifierChaineSelectionnee(e.target.value)}
                        className="w-full bg-[#0a0c10] border border-[#232a3b] text-white rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                        required
                    >
                        <option value="">-- Choisir une chaîne --</option>
                        {chainesDisponibles.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Mots-clés</label>
                    <input
                        type="text"
                        value={termeRecherche}
                        onChange={(e) => modifierTermeRecherche(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full bg-[#0a0c10] border border-[#232a3b] text-white rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={chargement}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm px-6 py-3 font-medium disabled:bg-gray-700 cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
                >
                    {chargement ? 'Recherche...' : 'Rechercher'}
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {resultats.map((item) => (
                    <div
                        key={item.id.videoId || item.id}
                        onClick={() => naviguer(`/lecture/${item.id.videoId || item.id}`)}
                        className="bg-[#181d2a] border border-[#232a3b] hover:border-[#35415a] rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all hover:-translate-y-1"
                    >
                        <img
                            src={item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url}
                            alt={item.snippet.title}
                            className="w-full aspect-video object-cover"
                        />
                        <div className="p-4">
                            <h3 className="font-semibold text-sm text-white line-clamp-2">{item.snippet.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recherche;