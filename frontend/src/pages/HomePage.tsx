import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrendingAnime } from '../hooks/useAnime';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { AnimeGrid } from '../components/AnimeGrid';
import { AnimeModal } from '../components/AnimeModal';
import { Anime } from '../types';

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
        title="Welcome to AinzAnime"
        subtitle="Discover and stream your favorite anime and manga"
      >
        <div className="max-w-md mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </Hero>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">🔥 Trending Now</h2>
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
