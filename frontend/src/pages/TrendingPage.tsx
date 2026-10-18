import React, { useState } from 'react';
import { useTrendingAnime } from '../hooks/useAnime';
import { TrendingUp, Star, Play } from 'lucide-react';
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-netflix text-white shadow-md shadow-red-600/30">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">Trending Now</h1>
            <p className="text-slate-400 text-sm mt-0.5">Top-rated anime trending across the community</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            <p className="text-slate-400 font-medium text-sm">Loading trending anime...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(data?.data || []).map((anime: Anime, index: number) => (
              <div
                key={anime.mal_id}
                onClick={() => handleAnimeClick(anime)}
                className="group cursor-pointer flex items-center gap-4 rounded-xl bg-slate-900/80 border border-slate-800/80 p-3.5 hover:border-red-500/40 hover:bg-slate-850 hover:shadow-lg transition-all duration-200"
              >
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-heading font-bold text-sm sm:text-base flex-shrink-0 shadow-md ${
                  index === 0
                    ? 'bg-amber-500 text-black shadow-amber-500/30'
                    : index === 1
                    ? 'bg-slate-300 text-slate-900 shadow-slate-300/30'
                    : index === 2
                    ? 'bg-amber-700 text-white shadow-amber-700/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}>
                  #{index + 1}
                </div>
                <img
                  src={anime.images.jpg.small_image_url}
                  alt={anime.title}
                  className="h-20 w-14 rounded-lg object-cover flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/56x80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1 text-base sm:text-lg">
                    {anime.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1 font-semibold text-yellow-400">
                      <Star className="h-3 w-3 fill-yellow-400" />
                      {anime.score ? anime.score.toFixed(1) : 'N/A'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3 text-slate-500" />
                      {anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{anime.type || 'Anime'}</span>
                    <span>•</span>
                    <span className="text-slate-500">{anime.status}</span>
                  </div>
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
