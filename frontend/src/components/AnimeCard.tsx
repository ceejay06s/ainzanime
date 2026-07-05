import React from 'react';
import { Star, Clock, Users } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onClick?: (id: number) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(anime.mal_id)}
      className="group cursor-pointer overflow-hidden rounded-lg bg-slate-800 transition duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105"
    >
      <div className="relative overflow-hidden bg-slate-700 aspect-[9/12]">
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/225x318?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-semibold text-white text-sm group-hover:text-red-400 transition">
          {anime.title}
        </h3>
        <div className="mt-2 space-y-1 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {anime.score.toFixed(1)}
            </span>
            <span className="text-slate-400">{anime.type}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {anime.episodes || '?'} eps
            </span>
          </div>
          {anime.status && (
            <div className="text-slate-500 text-xs">
              {anime.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
