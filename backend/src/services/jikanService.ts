import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });
const JIKAN_API = process.env.JIKAN_API_URL || 'https://api.jikan.moe/v4';

const jikanAxios = axios.create({
  baseURL: JIKAN_API,
  timeout: 10000
});

export const jikanService = {
  async getTrendingAnime(page = 1) {
    const cacheKey = `trending_anime_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await jikanAxios.get('/anime', {
        params: {
          order_by: 'score',
          sort: 'desc',
          page,
          limit: 25
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      throw error;
    }
  },

  async searchAnime(query: string, page = 1) {
    const cacheKey = `search_anime_${query}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await jikanAxios.get('/anime', {
        params: {
          query,
          page,
          limit: 25
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  },

  async getAnimeDetails(id: number) {
    const cacheKey = `anime_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await jikanAxios.get(`/anime/${id}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching anime ${id}:`, error);
      throw error;
    }
  },

  async getAnimeEpisodes(id: number, page = 1) {
    const cacheKey = `anime_episodes_${id}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await jikanAxios.get(`/anime/${id}/episodes`, {
        params: { page }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching episodes for anime ${id}:`, error);
      throw error;
    }
  },

  async getAnimeCharacters(id: number) {
    const cacheKey = `anime_characters_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await jikanAxios.get(`/anime/${id}/characters`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching characters for anime ${id}:`, error);
      throw error;
    }
  },

  async getTopAnime(filter = 'airing', page = 1) {
    const cacheKey = `top_anime_${filter}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await jikanAxios.get('/top/anime', {
        params: {
          filter,
          page,
          limit: 25
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching top anime:', error);
      throw error;
    }
  },

  async getAnimeByGenre(genreId: number, page = 1) {
    const cacheKey = `anime_genre_${genreId}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await jikanAxios.get('/anime', {
        params: {
          genres: genreId,
          page,
          limit: 25,
          order_by: 'score',
          sort: 'desc'
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime by genre:', error);
      throw error;
    }
  }
};
