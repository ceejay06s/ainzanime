import React, { useState } from 'react';
import { useLibraryStore } from '../store/libraryStore';
import { Heart, Trash2, Star, Tv } from 'lucide-react';
import { Hero } from '../components/Hero';
import { AnimeModal } from '../components/AnimeModal';
import { Anime } from '../types';

export const LibraryPage: React.FC = () => {
  const { favoriteAnime, watchlist, removeAnimeFromFavorites, removeAnimeFromWatchlist } = useLibraryStore();
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlist'>('favorites');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayAnime = activeTab === 'favorites' ? favoriteAnime : watchlist;

  return (
    <>
      <Hero title="My Library" subtitle="Your personal anime collection & watchlist" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-6 mb-8 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-4 font-heading font-semibold text-sm sm:text-base flex items-center gap-2 transition-all relative ${
              activeTab === 'favorites'
                ? 'text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="h-4 w-4" />
            Favorites ({favoriteAnime.length})
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`pb-4 font-heading font-semibold text-sm sm:text-base flex items-center gap-2 transition-all relative ${
              activeTab === 'watchlist'
                ? 'text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="h-4 w-4" />
            Watchlist ({watchlist.length})
          </button>
        </div>

        {displayAnime.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 max-w-md mx-auto text-center">
            <div className="p-4 rounded-2xl bg-slate-800/50 mb-4 text-slate-500">
              {activeTab === 'favorites' ? <Heart className="h-10 w-10 text-red-500/50" /> : <Tv className="h-10 w-10 text-red-500/50" />}
            </div>
            <h3 className="font-heading font-bold text-white text-lg mb-1">
              {activeTab === 'favorites' ? 'No favorites added yet' : 'Your watchlist is empty'}
            </h3>
            <p className="text-slate-400 text-sm">
              {activeTab === 'favorites'
                ? 'Browse anime or trending titles and click the heart icon to save them.'
                : 'Save anime you want to binge later.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAnime.map((anime) => (
              <div
                key={anime.mal_id}
                className="group flex items-center gap-4 rounded-xl bg-slate-900/80 border border-slate-800/80 p-3.5 hover:border-slate-700 hover:bg-slate-850 transition-all duration-200"
              >
                <img
                  src={anime.images.jpg.small_image_url}
                  alt={anime.title}
                  className="h-20 w-14 rounded-lg object-cover flex-shrink-0 shadow cursor-pointer group-hover:scale-105 transition-transform duration-300"
                  onClick={() => {
                    setSelectedAnime(anime);
                    setIsModalOpen(true);
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64x96';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => {
                      setSelectedAnime(anime);
                      setIsModalOpen(true);
                    }}
                    className="font-heading font-semibold text-white cursor-pointer hover:text-red-400 transition-colors line-clamp-1 text-base sm:text-lg"
                  >
                    {anime.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1 font-semibold text-yellow-400">
                      <Star className="h-3 w-3 fill-yellow-400" />
                      {anime.score ? anime.score.toFixed(1) : 'N/A'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">{anime.type || 'Anime'}</span>
                    <span>•</span>
                    <span>{anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (activeTab === 'favorites') {
                      removeAnimeFromFavorites(anime.mal_id);
                    } else {
                      removeAnimeFromWatchlist(anime.mal_id);
                    }
                  }}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  title="Remove from list"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimeModal
        anime={selectedAnime}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
