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
  <div className="rounded-lg bg-slate-800 animate-pulse aspect-[9/12]">
    <div className="h-full bg-gradient-to-b from-slate-700 to-slate-800" />
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array(24).fill(0).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!anime?.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
