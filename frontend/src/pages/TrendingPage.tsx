import React, { useState } from 'react';
import { useTrendingAnime } from '../hooks/useAnime';
import { TrendingUp } from 'lucide-react';
import { AnimeModal } from '../components/AnimeModal';
import { Anime } from '../types';

export const TrendingPage: React.FC = () => {
  const { data, isLoading } = useTrendingAnime(1);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnimeClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-red-500" />
          <h1 className="text-4xl font-bold text-white">Trending Now</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400 animate-pulse">Loading trending anime...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(data?.data || []).map((anime: Anime, index: number) => (
              <div
                key={anime.mal_id}
                onClick={() => handleAnimeClick(anime)}
                className="group cursor-pointer flex items-center gap-4 rounded-lg bg-slate-800 p-4 hover:bg-slate-700 transition"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-netflix text-white font-bold text-lg flex-shrink-0">
                  #{index + 1}
                </div>
                <img
                  src={anime.images.jpg.small_image_url}
                  alt={anime.title}
                  className="h-20 w-14 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/56x80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-red-400 transition line-clamp-1 text-lg">
                    {anime.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    ⭐ {anime.score.toFixed(1)} • 📺 {anime.episodes} episodes • {anime.status}
                  </p>
                </div>
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
