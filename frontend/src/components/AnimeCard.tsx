import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Play } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onClick?: (id: number) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  const navigate = useNavigate();

  const handleQuickWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${anime.mal_id}/1`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        
        {/* Hover backdrop gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
          {/* Quick Stream Play Button */}
          <button
            onClick={handleQuickWatch}
            title="Stream Episode 1"
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950/60 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 flex items-center justify-center ring-4 ring-red-600/30"
          >
            <Play className="h-5 w-5 fill-white text-white ml-0.5" />
          </button>
        </div>
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
