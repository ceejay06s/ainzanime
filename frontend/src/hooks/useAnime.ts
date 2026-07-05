import { useQuery } from '@tanstack/react-query';
import { animeService } from '../services/api';

export const useAnimeSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ['anime-search', query, page],
    queryFn: async () => {
      if (!query) return { data: [] };
      const response = await animeService.search(query, page);
      return response.data;
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTrendingAnime = (page = 1) => {
  return useQuery({
    queryKey: ['anime-trending', page],
    queryFn: async () => {
      const response = await animeService.getTrending(page);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useAnimeDetails = (id: number) => {
  return useQuery({
    queryKey: ['anime-details', id],
    queryFn: async () => {
      const response = await animeService.getDetails(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useAnimeEpisodes = (id: number, page = 1) => {
  return useQuery({
    queryKey: ['anime-episodes', id, page],
    queryFn: async () => {
      const response = await animeService.getEpisodes(id, page);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
