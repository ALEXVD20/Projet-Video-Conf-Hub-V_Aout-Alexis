import CarteVideo from './CarteVideo';

const GrilleVideos = ({ listeVideos, colonnes = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" }) => {
    if (!listeVideos || listeVideos.length === 0) {
        return (
            <div className="text-center text-gray-400 py-12 bg-[#12161f] border border-[#232a3b] rounded-2xl">
                Aucune vidéo disponible.
            </div>
        );
    }

    return (
        <div className={`grid ${colonnes} gap-6`}>
            {listeVideos.map((video, idx) => {
                const idClé = video.id?.videoId || video.id || idx;
                return <CarteVideo key={idClé} donneesVideo={video} />;
            })}
        </div>
    );
};

export default GrilleVideos;