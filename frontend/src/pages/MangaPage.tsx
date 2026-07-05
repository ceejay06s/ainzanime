import React, { useState } from 'react';
import { useTrendingManga, useMangaSearch } from '../hooks/useManga';
import { useSearchParams } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { BookOpen } from 'lucide-react';

export const MangaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offset, setOffset] = useState(0);
  
  const searchQuery = searchParams.get('search') || '';
  const { data: searchData, isLoading: searchLoading } = useMangaSearch(searchQuery, 25, offset);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingManga(25, offset);

  const isLoading = searchQuery ? searchLoading : trendingLoading;
  const manga = (searchQuery ? searchData?.data : trendingData?.data) || [];

  const handleSearch = (query: string) => {
    setOffset(0);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <Hero title="Manga Library" subtitle="Read your favorite manga" >
        <div className="max-w-md mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </Hero>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400 animate-pulse">Loading manga...</p>
          </div>
        ) : !manga.length ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">
              {searchQuery ? `No results for "${searchQuery}"` : 'No manga found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {manga.map((item: any) => (
              <div
                key={item.id}
                className="group cursor-pointer overflow-hidden rounded-lg bg-slate-800 p-4 hover:bg-slate-700 transition"
              >
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-red-400 transition line-clamp-2">
                      {item.attributes.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {item.attributes.status}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {item.attributes.description?.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
