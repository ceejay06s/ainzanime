import React from 'react';
import { X, Star, Calendar, Building2 } from 'lucide-react';
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
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-slate-900 text-white shadow-2xl">
          <div className="relative">
            <img
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x300';
              }}
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-2 hover:bg-black/75 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{anime.title}</h2>
              {anime.title_english && anime.title_english !== anime.title && (
                <p className="text-slate-400 text-sm">{anime.title_english}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Score</div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold">{anime.score.toFixed(1)}</span>
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Episodes</div>
                <div className="text-lg font-bold">{anime.episodes || '?'}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Type</div>
                <div className="text-lg font-bold">{anime.type}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status</div>
                <div className="text-lg font-bold">{anime.status}</div>
              </div>
            </div>

            {anime.synopsis && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Synopsis</h3>
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-5">
                  {anime.synopsis}
                </p>
              </div>
            )}

            {anime.genres?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="inline-block rounded-full bg-red-600/20 px-3 py-1 text-xs font-medium text-red-400"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {anime.studios?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Studios
                </h3>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.map((studio) => (
                    <span key={studio.mal_id} className="text-sm text-slate-300">
                      {studio.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={toggleFavorite}
                className={`flex-1 rounded-lg py-2 font-medium transition ${
                  isFavorited
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-slate-800 py-2 font-medium text-white hover:bg-slate-700 transition"
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
