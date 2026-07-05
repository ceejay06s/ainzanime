import axios from 'axios';
import { Anime, Manga, Episode } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Anime services
export const animeService = {
  getTrending: (page = 1) =>
    api.get<{ data: Anime[] }>('/anime/trending', { params: { page } }),
  
  search: (query: string, page = 1) =>
    api.get<{ data: Anime[] }>('/anime/search', { params: { q: query, page } }),
  
  getTop: (filter = 'airing', page = 1) =>
    api.get<{ data: Anime[] }>('/anime/top', { params: { filter, page } }),
  
  getDetails: (id: number) =>
    api.get<{ data: Anime }>(`/anime/${id}`),
  
  getEpisodes: (id: number, page = 1) =>
    api.get<{ data: Episode[] }>(`/anime/${id}/episodes`, { params: { page } }),
  
  getCharacters: (id: number) =>
    api.get(`/anime/${id}/characters`),
  
  getByGenre: (genreId: number, page = 1) =>
    api.get<{ data: Anime[] }>(`/anime/genre/${genreId}`, { params: { page } }),
};

// Manga services
export const mangaService = {
  getTrending: (limit = 25, offset = 0) =>
    api.get<{ data: Manga[] }>('/manga/trending', { params: { limit, offset } }),
  
  search: (query: string, limit = 25, offset = 0) =>
    api.get<{ data: Manga[] }>('/manga/search', { params: { q: query, limit, offset } }),
  
  getDetails: (id: string) =>
    api.get<{ data: Manga }>(`/manga/${id}`),
  
  getChapters: (id: string, limit = 100, offset = 0) =>
    api.get<{ data: Chapter[] }>(`/manga/${id}/chapters`, { params: { limit, offset } }),
  
  getChapterPages: (chapterId: string) =>
    api.get(`/manga/chapter/${chapterId}/pages`),
  
  searchByTag: (tagId: string, limit = 25, offset = 0) =>
    api.get<{ data: Manga[] }>(`/manga/tag/${tagId}`, { params: { limit, offset } }),
  
  getTags: () =>
    api.get('/manga/tags'),
};

export default api;
