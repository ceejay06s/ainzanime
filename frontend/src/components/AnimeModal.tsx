import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Building2, Play, Bookmark, Heart, Tv } from 'lucide-react';
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
  const navigate = useNavigate();
  const {
    isFavoriteAnime,
    addAnimeToFavorites,
    removeAnimeFromFavorites,
    isInWatchlist,
    addAnimeToWatchlist,
    removeAnimeFromWatchlist,
    getLastWatchedEpisode,
    isEpisodeWatched
  } = useLibraryStore();

  const [isFavorited, setIsFavorited] = React.useState(false);
  const [inWatchlist, setInWatchlist] = React.useState(false);

  React.useEffect(() => {
    if (anime) {
      setIsFavorited(isFavoriteAnime(anime.mal_id));
      setInWatchlist(isInWatchlist(anime.mal_id));
    }
  }, [anime, isFavoriteAnime, isInWatchlist]);

  if (!isOpen || !anime) return null;

  const lastWatched = getLastWatchedEpisode(anime.mal_id);
  const resumeEpisodeNumber = lastWatched || 1;

  const toggleFavorite = () => {
    if (isFavorited) {
      removeAnimeFromFavorites(anime.mal_id);
    } else {
      addAnimeToFavorites(anime);
    }
    setIsFavorited(!isFavorited);
  };

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeAnimeFromWatchlist(anime.mal_id);
    } else {
      addAnimeToWatchlist(anime);
    }
    setInWatchlist(!inWatchlist);
  };

  const handleStartStreaming = (episodeNum = resumeEpisodeNumber) => {
    onClose();
    navigate(`/watch/${anime.mal_id}/${episodeNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickEpisodesCount = Math.min(anime.episodes || 12, 12);

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
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x300';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/50" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-lg backdrop-blur-md"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Floating Play Overlay Button */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
                  {anime.type || 'Anime'}
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white mt-1 drop-shadow-md">
                  {anime.title}
                </h2>
              </div>

              <button
                onClick={() => handleStartStreaming(resumeEpisodeNumber)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-sm shadow-xl shadow-red-900/50 hover:scale-105 transition-all flex-shrink-0"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>{lastWatched ? `Resume Ep ${lastWatched}` : 'Stream Episode 1'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 relative">
            {anime.title_english && anime.title_english !== anime.title && (
              <p className="text-slate-400 text-sm -mt-2">{anime.title_english}</p>
            )}

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
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-medium">Duration</div>
                <div className="text-lg font-bold text-slate-100">{anime.duration || '24 min'}</div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3.5">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-medium">Status</div>
                <div className="text-base sm:text-lg font-bold text-slate-100 truncate">{anime.status || 'Unknown'}</div>
              </div>
            </div>

            {/* Quick Episodes Preview Selector */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                  <Tv className="h-4 w-4 text-red-500" />
                  <span>Available Episodes</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Select episode to stream directly
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {Array.from({ length: quickEpisodesCount }, (_, i) => {
                  const epNum = i + 1;
                  const isWatched = isEpisodeWatched(anime.mal_id, epNum);
                  const isCurrent = epNum === resumeEpisodeNumber;

                  return (
                    <button
                      key={epNum}
                      onClick={() => handleStartStreaming(epNum)}
                      className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                        isCurrent
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40'
                          : isWatched
                          ? 'bg-slate-900 text-emerald-400 border-emerald-900/40 hover:bg-slate-800'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-red-500/50 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>EP {epNum}</span>
                      {isWatched && <span className="text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {anime.synopsis && (
              <div>
                <h3 className="font-heading font-semibold mb-2 text-base text-slate-200">Synopsis</h3>
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
                  {anime.synopsis}
                </p>
              </div>
            )}

            {anime.genres?.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold mb-2 text-sm text-slate-300">Genres</h3>
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
                <h3 className="font-heading font-semibold mb-2 flex items-center gap-2 text-slate-300 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Studios
                </h3>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.map((studio) => (
                    <span key={studio.mal_id} className="text-xs text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
                      {studio.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleStartStreaming(resumeEpisodeNumber)}
                className="flex-1 min-w-[140px] rounded-xl py-2.5 font-heading font-bold text-sm bg-red-600 text-white hover:bg-red-500 transition shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>{lastWatched ? `Resume Ep ${lastWatched}` : 'Stream Now'}</span>
              </button>

              <button
                onClick={toggleFavorite}
                className={`px-4 py-2.5 rounded-xl font-medium text-xs border transition flex items-center gap-1.5 ${
                  isFavorited
                    ? 'bg-slate-800 text-red-400 border-red-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-red-400 text-red-400' : ''}`} />
                <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
              </button>

              <button
                onClick={toggleWatchlist}
                className={`px-4 py-2.5 rounded-xl font-medium text-xs border transition flex items-center gap-1.5 ${
                  inWatchlist
                    ? 'bg-slate-800 text-red-400 border-red-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${inWatchlist ? 'fill-red-400 text-red-400' : ''}`} />
                <span>{inWatchlist ? 'Watchlist' : 'Add to List'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 text-xs font-medium transition"
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

