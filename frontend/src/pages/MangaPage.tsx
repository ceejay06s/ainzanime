import React, { useState } from 'react';
import { useTrendingManga, useMangaSearch } from '../hooks/useManga';
import { useSearchParams } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { BookOpen, BookmarkCheck } from 'lucide-react';

export const MangaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offset, setOffset] = useState(0);
  
  const searchQuery = searchParams.get('search') || '';
  const { data: searchData, isLoading: searchLoading } = useMangaSearch(searchQuery, 24, offset);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingManga(24, offset);

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
      <Hero title="Manga Library" subtitle="Explore popular manga series and chapters">
        <div className="max-w-md mx-auto">
          <SearchBar onSearch={handleSearch} placeholder="Search manga titles..." />
        </div>
      </Hero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            <p className="text-slate-400 font-medium text-sm">Loading manga catalog...</p>
          </div>
        ) : !manga.length ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 max-w-md mx-auto text-center">
            <BookOpen className="h-10 w-10 text-slate-500 mb-3" />
            <p className="text-slate-300 font-medium">
              {searchQuery ? `No manga found matching "${searchQuery}"` : 'No manga available at this moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manga.map((item: any) => (
              <div
                key={item.id}
                className="group cursor-pointer overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-5 hover:border-red-500/40 hover:bg-slate-850 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 flex-shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2 text-base leading-snug">
                      {item.attributes.title?.en || Object.values(item.attributes.title || {})[0] || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 capitalize">
                        <BookmarkCheck className="h-3 w-3 text-red-400" />
                        {item.attributes.status || 'Ongoing'}
                      </span>
                      {item.attributes.year && (
                        <span className="text-xs text-slate-500">{item.attributes.year}</span>
                      )}
                    </div>
                    {item.attributes.description?.en && (
                      <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                        {item.attributes.description.en}
                      </p>
                    )}
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
