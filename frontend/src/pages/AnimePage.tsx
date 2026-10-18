import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrendingAnime, useAnimeSearch } from '../hooks/useAnime';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { AnimeGrid } from '../components/AnimeGrid';
import { Pagination } from '../components/Pagination';
import { AnimeModal } from '../components/AnimeModal';
import { Anime } from '../types';

export const AnimePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const { data: searchData, isLoading: searchLoading } = useAnimeSearch(searchQuery, page);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingAnime(page);

  const isLoading = searchQuery ? searchLoading : trendingLoading;
  const anime = (searchQuery ? searchData?.data : trendingData?.data) || [];
  const hasNextPage = anime.length >= 24;

  const handleSearch = (query: string) => {
    setPage(1);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const handleAnimeClick = (id: number) => {
    const selected = anime.find((a: Anime) => a.mal_id === id);
    if (selected) {
      setSelectedAnime(selected);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Hero
        title="Explore Anime Catalog"
        subtitle="Search thousands of titles, filter by popularity, or discover new releases"
      >
        <div className="max-w-md mx-auto">
          <SearchBar onSearch={handleSearch} placeholder="Search by title, genre, studio..." />
        </div>
      </Hero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {searchQuery ? (
              <>Showing results for <span className="font-semibold text-white">"{searchQuery}"</span></>
            ) : (
              'All Anime Releases'
            )}
          </p>
        </div>

        <AnimeGrid
          anime={anime}
          isLoading={isLoading}
          onAnimeClick={handleAnimeClick}
          emptyMessage={searchQuery ? `No anime found matching "${searchQuery}"` : 'Loading anime catalog...'}
        />

        <Pagination
          currentPage={page}
          onPageChange={setPage}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
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
