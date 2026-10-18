import React from 'react';
import { Star, Clock } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onClick?: (id: number) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(anime.mal_id)}
      className="group cursor-pointer overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 transition-all duration-300 hover:border-red-500/50 hover:shadow-glow hover:-translate-y-1.5 flex flex-col"
    >
      <div className="relative overflow-hidden bg-slate-800 aspect-[3/4] w-full">
        {anime.score ? (
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-md bg-black/75 backdrop-blur-md px-2 py-0.5 text-xs font-bold text-yellow-400 border border-white/10 shadow-lg">
            <Star className="h-3 w-3 fill-yellow-400" />
            <span>{anime.score.toFixed(1)}</span>
          </div>
        ) : null}

        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/225x318?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
      </div>

      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <h3 className="line-clamp-2 font-semibold text-slate-100 text-sm group-hover:text-red-400 transition-colors leading-snug">
          {anime.title}
        </h3>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">{anime.type || 'Anime'}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-500" />
            {anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}
          </span>
        </div>
      </div>
    </div>
  );
};
