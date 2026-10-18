import React from 'react';
import { Anime } from '../types';
import { AnimeCard } from './AnimeCard';

interface AnimeGridProps {
  anime: Anime[];
  isLoading?: boolean;
  onAnimeClick?: (id: number) => void;
  emptyMessage?: string;
}

const SkeletonCard = () => (
  <div className="rounded-xl bg-slate-900 border border-slate-800/80 overflow-hidden animate-pulse flex flex-col aspect-[3/4]">
    <div className="flex-1 bg-slate-800/70" />
    <div className="p-3.5 space-y-2 border-t border-slate-800/60">
      <div className="h-3.5 bg-slate-800 rounded w-4/5" />
      <div className="h-3 bg-slate-800/50 rounded w-1/2" />
    </div>
  </div>
);

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  anime,
  isLoading,
  onAnimeClick,
  emptyMessage = 'No anime found. Try searching for something else!'
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-5">
        {Array(18).fill(0).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!anime?.length) {
    return (
      <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-8 max-w-lg mx-auto">
        <p className="text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-5">
      {anime.map((item) => (
        <AnimeCard
          key={item.mal_id}
          anime={item}
          onClick={onAnimeClick}
        />
      ))}
    </div>
  );
};
