import React from 'react';
import { useLibraryStore } from '../store/libraryStore';
import { Heart, Trash2 } from 'lucide-react';
import { AnimeGrid } from '../components/AnimeGrid';
import { Hero } from '../components/Hero';
import { useState } from 'react';
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
      <Hero title="My Library" subtitle="Your personal anime collection" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex gap-4 mb-8 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-4 font-semibold transition ${
              activeTab === 'favorites'
                ? 'border-b-2 border-red-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="inline mr-2 h-5 w-5" />
            Favorites ({favoriteAnime.length})
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`pb-4 font-semibold transition ${
              activeTab === 'watchlist'
                ? 'border-b-2 border-red-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📺 Watchlist ({watchlist.length})
          </button>
        </div>

        {displayAnime.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Heart className="h-16 w-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">
              {activeTab === 'favorites'
                ? 'No favorite anime yet. Add some!'
                : 'Your watchlist is empty. Add anime to watch later!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAnime.map((anime) => (
              <div
                key={anime.mal_id}
                className="group flex items-center gap-4 rounded-lg bg-slate-800 p-4 hover:bg-slate-700 transition"
              >
                <img
                  src={anime.images.jpg.small_image_url}
                  alt={anime.title}
                  className="h-24 w-16 rounded object-cover flex-shrink-0"
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
                    className="font-semibold text-white cursor-pointer hover:text-red-400 transition line-clamp-1 text-lg"
                  >
                    {anime.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    ⭐ {anime.score.toFixed(1)} • {anime.type} • {anime.episodes} eps
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (activeTab === 'favorites') {
                      removeAnimeFromFavorites(anime.mal_id);
                    } else {
                      removeAnimeFromWatchlist(anime.mal_id);
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 transition flex-shrink-0"
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
