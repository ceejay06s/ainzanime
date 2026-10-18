import React from 'react';
import { X, Star, Building2 } from 'lucide-react';
import { Anime } from '../types';
import { useLibraryStore } from '../store/libraryStore';

interface AnimeModalProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnimeModal: React.FC<AnimeModalProps> = ({
  anime,
  isOpen,
  onClose
}) => {
  const { isFavoriteAnime, addAnimeToFavorites, removeAnimeFromFavorites } = useLibraryStore();
  const [isFavorited, setIsFavorited] = React.useState(false);

  React.useEffect(() => {
    if (anime) {
      setIsFavorited(isFavoriteAnime(anime.mal_id));
    }
  }, [anime, isFavoriteAnime]);

  if (!isOpen || !anime) return null;

  const toggleFavorite = () => {
    if (isFavorited) {
      removeAnimeFromFavorites(anime.mal_id);
    } else {
      addAnimeToFavorites(anime);
    }
    setIsFavorited(!isFavorited);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl transition-all">
          <div className="relative">
            <img
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              className="w-full h-56 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x300';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-lg backdrop-blur-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 -mt-6 relative">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1.5">{anime.title}</h2>
              {anime.title_english && anime.title_english !== anime.title && (
                <p className="text-slate-400 text-sm">{anime.title_english}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3.5">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-medium">Score</div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-slate-100">{anime.score ? anime.score.toFixed(1) : 'N/A'}</span>
                </div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3.5">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-medium">Episodes</div>
                <div className="text-lg font-bold text-slate-100">{anime.episodes || '?'}</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3.5">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-medium">Type</div>
                <div className="text-lg font-bold text-slate-100">{anime.type || 'N/A'}</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3.5">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-medium">Status</div>
                <div className="text-base sm:text-lg font-bold text-slate-100 truncate">{anime.status || 'Unknown'}</div>
              </div>
            </div>

            {anime.synopsis && (
              <div>
                <h3 className="font-heading font-semibold mb-2 text-lg text-slate-200">Synopsis</h3>
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-5">
                  {anime.synopsis}
                </p>
              </div>
            )}

            {anime.genres?.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold mb-2 text-lg text-slate-200">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="inline-block rounded-full bg-red-600/15 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {anime.studios?.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold mb-2 flex items-center gap-2 text-slate-200 text-lg">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Studios
                </h3>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.map((studio) => (
                    <span key={studio.mal_id} className="text-sm text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
                      {studio.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={toggleFavorite}
                className={`flex-1 rounded-xl py-2.5 font-medium transition shadow-md ${
                  isFavorited
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 font-medium text-white hover:bg-slate-700 border border-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
