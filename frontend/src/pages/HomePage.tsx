import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrendingAnime } from '../hooks/useAnime';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { AnimeGrid } from '../components/AnimeGrid';
import { AnimeModal } from '../components/AnimeModal';
import { Anime } from '../types';
import { ChevronRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useTrendingAnime(1);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (query: string) => {
    if (query) {
      navigate(`/anime?search=${encodeURIComponent(query)}`);
    }
  };

  const handleAnimeClick = (id: number) => {
    const anime = data?.data?.find((a: Anime) => a.mal_id === id);
    if (anime) {
      setSelectedAnime(anime);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Hero
        title="Discover & Stream Anime"
        subtitle="Explore thousands of anime series, movies, and manga chapters in one place"
      >
        <div className="max-w-md mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </Hero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white flex items-center gap-2">
              <span className="text-red-500">🔥</span> Trending Anime
            </h2>
            <p className="text-slate-400 text-sm mt-1">Most popular shows this season</p>
          </div>
          <Link
            to="/trending"
            className="text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 group pb-0.5"
          >
            View all
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <AnimeGrid
          anime={data?.data || []}
          isLoading={isLoading}
          onAnimeClick={handleAnimeClick}
        />
      </div>

      <AnimeModal
        anime={selectedAnime}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
