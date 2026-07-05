import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });
const MANGADEX_API = process.env.MANGADEX_API_URL || 'https://api.mangadex.org';

const mangadexAxios = axios.create({
  baseURL: MANGADEX_API,
  timeout: 10000
});

export const mangadexService = {
  async getTrendingManga(limit = 25, offset = 0) {
    const cacheKey = `trending_manga_${limit}_${offset}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await mangadexAxios.get('/manga', {
        params: {
          limit,
          offset,
          order: { rating: 'desc' },
          includes: ['author', 'artist', 'cover_art']
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending manga:', error);
      throw error;
    }
  },

  async searchManga(query: string, limit = 25, offset = 0) {
    const cacheKey = `search_manga_${query}_${limit}_${offset}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await mangadexAxios.get('/manga', {
        params: {
          title: query,
          limit,
          offset,
          includes: ['author', 'artist', 'cover_art']
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching manga:', error);
      throw error;
    }
  },

  async getMangaDetails(id: string) {
    const cacheKey = `manga_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await mangadexAxios.get(`/manga/${id}`, {
        params: {
          includes: ['author', 'artist', 'cover_art']
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching manga ${id}:`, error);
      throw error;
    }
  },

  async getMangaChapters(id: string, limit = 100, offset = 0) {
    const cacheKey = `manga_chapters_${id}_${limit}_${offset}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await mangadexAxios.get(`/manga/${id}/feed`, {
        params: {
          limit,
          offset,
          'order[chapter]': 'asc'
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chapters for manga ${id}:`, error);
      throw error;
    }
  },

  async getChapterPages(chapterId: string) {
    const cacheKey = `chapter_pages_${chapterId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await mangadexAxios.get(`/at-home/server/${chapterId}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pages for chapter ${chapterId}:`, error);
      throw error;
    }
  },

  async searchByTag(tagId: string, limit = 25, offset = 0) {
    const cacheKey = `manga_tag_${tagId}_${limit}_${offset}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await mangadexAxios.get('/manga', {
        params: {
          'includedTags[]': tagId,
          limit,
          offset,
          includes: ['author', 'artist', 'cover_art']
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching manga by tag:', error);
      throw error;
    }
  },

  async getTags() {
    const cacheKey = 'manga_tags';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await mangadexAxios.get('/manga/tag');
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }
};
