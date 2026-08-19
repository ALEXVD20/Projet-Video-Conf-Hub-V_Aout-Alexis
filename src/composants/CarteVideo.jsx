import { Link } from 'react-router-dom';

const CarteVideo = ({ donneesVideo }) => {
    if (!donneesVideo || !donneesVideo.snippet) return null;

    const { snippet } = donneesVideo;

    const idVideo =
        snippet.resourceId?.videoId ||
        donneesVideo.id?.videoId ||
        (typeof donneesVideo.id === 'string' ? donneesVideo.id : null);

    const urlMiniature =
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url;

    return (
        <Link
            to={`/lecture/${idVideo}`}
            className="group bg-[#181d2a] border border-[#232a3b] hover:border-[#35415a] rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/10 transition-all duration-200 flex flex-col h-full no-underline"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-[#0a0c10]">
                {urlMiniature && (
                    <img
                        src={urlMiniature}
                        alt={snippet.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-sm text-gray-100 line-clamp-2 mb-2 flex-grow group-hover:text-blue-400 transition-colors">
                    {snippet.title}
                </h3>

                {snippet.channelTitle && (
                    <p className="text-xs text-gray-400 font-medium mb-1 line-clamp-1">
                        {snippet.channelTitle}
                    </p>
                )}

                {snippet.publishedAt && (
                    <p className="text-xs text-gray-500">
                        {new Date(snippet.publishedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </p>
                )}
            </div>
        </Link>
    );
};

export default CarteVideo;