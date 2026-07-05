import { useQuery } from '@tanstack/react-query';
import { mangaService } from '../services/api';

export const useMangaSearch = (query: string, limit = 25, offset = 0) => {
  return useQuery({
    queryKey: ['manga-search', query, limit, offset],
    queryFn: async () => {
      if (!query) return { data: [] };
      const response = await mangaService.search(query, limit, offset);
      return response.data;
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTrendingManga = (limit = 25, offset = 0) => {
  return useQuery({
    queryKey: ['manga-trending', limit, offset],
    queryFn: async () => {
      const response = await mangaService.getTrending(limit, offset);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useMangaDetails = (id: string) => {
  return useQuery({
    queryKey: ['manga-details', id],
    queryFn: async () => {
      const response = await mangaService.getDetails(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useMangaChapters = (id: string, limit = 100, offset = 0) => {
  return useQuery({
    queryKey: ['manga-chapters', id, limit, offset],
    queryFn: async () => {
      const response = await mangaService.getChapters(id, limit, offset);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
