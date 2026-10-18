import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 1800 }); // 30 minutes cache

const ANILIST_URL = 'https://graphql.anilist.co';
const KITSU_URL = 'https://kitsu.io/api/edge';
const MIRURO_URL = 'https://www.miruro.tv';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const anilistAxios = axios.create({
  baseURL: ANILIST_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': USER_AGENT
  }
});

const kitsuAxios = axios.create({
  baseURL: KITSU_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    'User-Agent': USER_AGENT
  }
});

const miruroAxios = axios.create({
  baseURL: MIRURO_URL,
  timeout: 10000,
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'User-Agent': USER_AGENT
  }
});

// GraphQL Queries for AniList
const MEDIA_FRAGMENT = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
  }
  bannerImage
  format
  episodes
  duration
  status
  season
  seasonYear
  averageScore
  popularity
  genres
  description
  studios(isMain: true) {
    nodes {
      id
      name
    }
  }
  trailer {
    id
    site
  }
  nextAiringEpisode {
    airingAt
    timeUntilAiring
    episode
  }
`;


const ANILIST_PAGE_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $id: Int, $genre: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(sort: $sort, search: $search, id: $id, genre: $genre, type: ANIME, isAdult: false) {
      ${MEDIA_FRAGMENT}
    }
  }
}
`;

const ANILIST_DETAILS_QUERY = `
query ($id: Int, $idMal: Int) {
  Media(id: $id, idMal: $idMal, type: ANIME) {
    ${MEDIA_FRAGMENT}
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
    characters(perPage: 12, sort: [ROLE, RELEVANCE]) {
      nodes {
        id
        name {
          full
        }
        image {
          medium
        }
      }
    }
  }
}
`;

const ANILIST_EPISODES_QUERY = `
query ($id: Int, $idMal: Int) {
  Media(id: $id, idMal: $idMal, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
    }
    episodes
    duration
    status
    coverImage {
      large
    }
    nextAiringEpisode {
      airingAt
      timeUntilAiring
      episode
    }
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
  }
}
`;


export interface MiruroItem {
  name: string;
  url: string;
  watchUrl: string;
}

export const animeService = {
  /**
   * Scrapes real-time Trending Anime directly from miruro.tv
   */
  async scrapeMiruroTrending(): Promise<MiruroItem[]> {
    const cacheKey = 'miruro_trending_scraped';
    const cached = cache.get<MiruroItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await miruroAxios.get('/');
      const html = response.data as string;
      const jsonLds = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];

      for (const block of jsonLds) {
        const jsonStr = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed['@type'] === 'ItemList' && Array.isArray(parsed.itemListElement)) {
            const items: MiruroItem[] = parsed.itemListElement.map((item: any) => {
              const infoUrl = item.url || '';
              // miruro watch URL format: /watch/...
              const watchUrl = infoUrl.replace('/info/', '/watch/');
              return {
                name: item.name,
                url: infoUrl,
                watchUrl: watchUrl || `https://www.miruro.tv/search?q=${encodeURIComponent(item.name)}`
              };
            });

            if (items.length > 0) {
              cache.set(cacheKey, items, 3600); // cache for 1 hour
              return items;
            }
          }
        } catch {
          // ignore parsing error of non-matching JSON-LD
        }
      }
    } catch (err: any) {
      console.warn('Miruro scrape failed, fallback available:', err.message);
    }

    return [];
  },

  /**
   * Get trending anime using Miruro scraping + AniList metadata enrichment
   */
  async getTrendingAnime(page = 1) {
    const cacheKey = `trending_anime_v2_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // On page 1, attempt to get Miruro's real-time trending list
    let miruroSlugMap = new Map<string, string>();
    if (page === 1) {
      try {
        const miruroItems = await this.scrapeMiruroTrending();
        for (const item of miruroItems) {
          miruroSlugMap.set(item.name.toLowerCase(), item.watchUrl);
        }
      } catch (err) {
        console.warn('Could not populate Miruro slug map:', err);
      }
    }

    try {
      // 1. Primary provider: AniList GraphQL
      const response = await anilistAxios.post('', {
        query: ANILIST_PAGE_QUERY,
        variables: {
          page,
          perPage: 24,
          sort: ['TRENDING_DESC', 'POPULARITY_DESC']
        }
      });

      const pageData = response.data?.data?.Page;
      if (pageData && pageData.media) {
        const mappedData = pageData.media.map((item: any) =>
          this.mapAniListToJikan(item, miruroSlugMap)
        );

        const result = {
          data: mappedData,
          pagination: {
            last_visible_page: pageData.pageInfo.lastPage,
            has_next_page: pageData.pageInfo.hasNextPage,
            current_page: pageData.pageInfo.currentPage,
            items: {
              count: mappedData.length,
              total: pageData.pageInfo.total,
              per_page: pageData.pageInfo.perPage
            }
          }
        };

        cache.set(cacheKey, result);
        return result;
      }
    } catch (aniListError: any) {
      console.warn('AniList failed, falling back to Kitsu:', aniListError.message);
    }

    // 2. Secondary fallback provider: Kitsu API
    try {
      const offset = (page - 1) * 20;
      const response = await kitsuAxios.get('/anime', {
        params: {
          'page[limit]': 20,
          'page[offset]': offset,
          sort: '-userCount'
        }
      });

      const kitsuData = response.data?.data || [];
      const mappedData = kitsuData.map((item: any) => this.mapKitsuToJikan(item));

      const result = {
        data: mappedData,
        pagination: {
          last_visible_page: Math.ceil((response.data?.meta?.count || 100) / 20),
          has_next_page: kitsuData.length === 20,
          current_page: page,
          items: {
            count: mappedData.length,
            total: response.data?.meta?.count || mappedData.length,
            per_page: 20
          }
        }
      };

      cache.set(cacheKey, result);
      return result;
    } catch (kitsuError: any) {
      console.error('All providers failed for trending anime:', kitsuError.message);
      throw new Error('Failed to fetch trending anime from all sources');
    }
  },

  /**
   * Search anime by query string
   */
  async searchAnime(query: string, page = 1) {
    const cacheKey = `search_anime_v2_${query.toLowerCase()}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await anilistAxios.post('', {
        query: ANILIST_PAGE_QUERY,
        variables: {
          search: query,
          page,
          perPage: 24,
          sort: ['SEARCH_MATCH', 'POPULARITY_DESC']
        }
      });

      const pageData = response.data?.data?.Page;
      if (pageData && pageData.media) {
        const mappedData = pageData.media.map((item: any) => this.mapAniListToJikan(item));

        const result = {
          data: mappedData,
          pagination: {
            last_visible_page: pageData.pageInfo.lastPage,
            has_next_page: pageData.pageInfo.hasNextPage,
            current_page: pageData.pageInfo.currentPage,
            items: {
              count: mappedData.length,
              total: pageData.pageInfo.total,
              per_page: pageData.pageInfo.perPage
            }
          }
        };

        cache.set(cacheKey, result);
        return result;
      }
    } catch (err: any) {
      console.warn('AniList search failed, falling back to Kitsu:', err.message);
    }

    // Kitsu fallback
    try {
      const offset = (page - 1) * 20;
      const response = await kitsuAxios.get('/anime', {
        params: {
          'filter[text]': query,
          'page[limit]': 20,
          'page[offset]': offset
        }
      });

      const kitsuData = response.data?.data || [];
      const mappedData = kitsuData.map((item: any) => this.mapKitsuToJikan(item));

      const result = {
        data: mappedData,
        pagination: {
          last_visible_page: Math.ceil((response.data?.meta?.count || 100) / 20),
          has_next_page: kitsuData.length === 20,
          current_page: page,
          items: {
            count: mappedData.length,
            total: response.data?.meta?.count || mappedData.length,
            per_page: 20
          }
        }
      };

      cache.set(cacheKey, result);
      return result;
    } catch (err: any) {
      console.error('Search failed across providers:', err.message);
      throw new Error(`Failed to search anime for: ${query}`);
    }
  },

  /**
   * Get Top-rated / popular anime
   */
  async getTopAnime(filter = 'airing', page = 1) {
    const cacheKey = `top_anime_v2_${filter}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const sortOption = filter === 'airing' ? ['POPULARITY_DESC'] : ['SCORE_DESC'];

    try {
      const response = await anilistAxios.post('', {
        query: ANILIST_PAGE_QUERY,
        variables: {
          page,
          perPage: 24,
          sort: sortOption
        }
      });

      const pageData = response.data?.data?.Page;
      if (pageData && pageData.media) {
        const mappedData = pageData.media.map((item: any) => this.mapAniListToJikan(item));

        const result = {
          data: mappedData,
          pagination: {
            last_visible_page: pageData.pageInfo.lastPage,
            has_next_page: pageData.pageInfo.hasNextPage,
            current_page: pageData.pageInfo.currentPage,
            items: {
              count: mappedData.length,
              total: pageData.pageInfo.total,
              per_page: pageData.pageInfo.perPage
            }
          }
        };

        cache.set(cacheKey, result);
        return result;
      }
    } catch (err: any) {
      console.warn('AniList top anime failed, falling back to Kitsu:', err.message);
    }

    // Kitsu fallback
    const sortField = filter === 'airing' ? '-averageRating' : '-userCount';
    const offset = (page - 1) * 20;
    const response = await kitsuAxios.get('/anime', {
      params: {
        'page[limit]': 20,
        'page[offset]': offset,
        sort: sortField
      }
    });

    const kitsuData = response.data?.data || [];
    const mappedData = kitsuData.map((item: any) => this.mapKitsuToJikan(item));

    const result = {
      data: mappedData,
      pagination: {
        last_visible_page: Math.ceil((response.data?.meta?.count || 100) / 20),
        has_next_page: kitsuData.length === 20,
        current_page: page,
        items: {
          count: mappedData.length,
          total: response.data?.meta?.count || mappedData.length,
          per_page: 20
        }
      }
    };

    cache.set(cacheKey, result);
    return result;
  },

  /**
   * Helper to query AniList by idMal first (for MAL ids), then fallback to native AniList id
   */
  async queryAniList(query: string, id: number) {
    // 1. Try idMal first (standard MAL id)
    try {
      const response = await anilistAxios.post('', {
        query,
        variables: { idMal: id }
      });
      if (response.data?.data?.Media) {
        return response.data.data.Media;
      }
    } catch {
      // ignore
    }

    // 2. Try native AniList id
    try {
      const response = await anilistAxios.post('', {
        query,
        variables: { id }
      });
      if (response.data?.data?.Media) {
        return response.data.data.Media;
      }
    } catch {
      // ignore
    }

    return null;
  },

  /**
   * Get single anime details by ID (either MAL ID or AniList ID)
   */
  async getAnimeDetails(id: number) {
    const cacheKey = `anime_details_v2_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // First try AniList with idMal then id
      const media = await this.queryAniList(ANILIST_DETAILS_QUERY, id);
      if (media) {
        const mapped = this.mapAniListToJikan(media);
        const result = { data: mapped };
        cache.set(cacheKey, result);
        return result;
      }
    } catch (err: any) {
      console.warn(`AniList details failed for ${id}, trying Kitsu:`, err.message);
    }

    // Kitsu fallback
    try {
      const response = await kitsuAxios.get(`/anime/${id}`);
      if (response.data?.data) {
        const mapped = this.mapKitsuToJikan(response.data.data);
        const result = { data: mapped };
        cache.set(cacheKey, result);
        return result;
      }
    } catch (err: any) {
      console.error(`Details failed across providers for ${id}:`, err.message);
      throw new Error(`Failed to fetch anime details for ID ${id}`);
    }
  },

  /**
   * Get episodes list for anime using AniList streamingEpisodes + generated data
   */
  async getAnimeEpisodes(id: number, page = 1) {
    const cacheKey = `anime_episodes_v3_${id}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Fetch AniList data with streaming episodes
      const anilistMedia: any = await this.queryAniList(ANILIST_EPISODES_QUERY, id);

      const totalEpisodes = anilistMedia?.episodes || anilistMedia?.nextAiringEpisode?.episode || 12;
      const title = anilistMedia?.title?.english || anilistMedia?.title?.romaji || 'Anime';
      const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const streamingEpisodes: any[] = anilistMedia?.streamingEpisodes || [];
      const coverImage = anilistMedia?.coverImage?.large || '';

      const perPage = 100;
      const startEp = (page - 1) * perPage + 1;
      const endEp = Math.min(startEp + perPage - 1, totalEpisodes);

      // Build a map of streaming episodes by episode number (parsed from title)
      const streamingMap = new Map<number, any>();
      for (const se of streamingEpisodes) {
        const epMatch = se.title?.match(/Episode\s+(\d+)/i) || se.title?.match(/^(\d+)\s*[-–]/);
        if (epMatch) {
          streamingMap.set(parseInt(epMatch[1], 10), se);
        }
      }

      const episodes = [];
      for (let ep = startEp; ep <= endEp; ep++) {
        const streamingEp = streamingMap.get(ep);
        const miruroWatchUrl = `https://www.miruro.tv/search?q=${encodeURIComponent(title)}`;

        episodes.push({
          mal_id: ep,
          number: ep,
          url: miruroWatchUrl,
          title: streamingEp?.title || `Episode ${ep}`,
          title_japanese: `第${ep}話`,
          title_romanji: `Episode ${ep}`,
          aired: anilistMedia?.seasonYear ? `${anilistMedia.seasonYear}` : 'Recent',
          score: null,
          filler: false,
          recap: false,
          forum_url: miruroWatchUrl,
          synopsis: `Watch ${title} Episode ${ep}`,
          thumbnail: streamingEp?.thumbnail || coverImage,
          streamUrl: streamingEp?.url || miruroWatchUrl,
          site: streamingEp?.site || 'Miruro',
          images: {
            jpg: {
              image_url: streamingEp?.thumbnail || coverImage
            }
          }
        });
      }

      const result = {
        data: episodes,
        anime: {
          mal_id: anilistMedia?.idMal || anilistMedia?.id || id,
          title,
          title_japanese: anilistMedia?.title?.native || '',
          totalEpisodes,
          coverImage,
          bannerImage: anilistMedia?.bannerImage || coverImage,
          status: anilistMedia?.status || 'UNKNOWN',
          duration: anilistMedia?.duration || 24
        },
        pagination: {
          last_visible_page: Math.ceil(totalEpisodes / perPage),
          has_next_page: endEp < totalEpisodes,
          current_page: page,
          items: {
            count: episodes.length,
            total: totalEpisodes,
            per_page: perPage
          }
        }
      };

      cache.set(cacheKey, result, 3600);
      return result;
    } catch (err: any) {
      console.error(`Failed to generate episodes for ${id}:`, err.message);
      return {
        data: [],
        anime: null,
        pagination: { last_visible_page: 1, has_next_page: false, current_page: 1 }
      };
    }
  },

  /**
   * Build a Miruro watch URL for an episode.
   * Prefers scraped /watch/{id}/{slug} links, then falls back to search.
   * Miruro's player origin (strm.cx) is used as the in-app embed shell.
   */
  buildMiruroWatchUrl(title: string, episode: number, scrapedWatchUrl?: string) {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let watchBase =
      scrapedWatchUrl ||
      `https://www.miruro.tv/search?q=${encodeURIComponent(title)}`;

    // Prefer /watch/ over /info/ when we have a scraped Miruro link
    watchBase = watchBase.replace('/info/', '/watch/');

    try {
      const parsed = new URL(watchBase);
      if (parsed.pathname.startsWith('/watch/')) {
        parsed.searchParams.set('ep', String(episode));
        return parsed.toString();
      }
    } catch {
      // ignore malformed scraped URLs
    }

    if (slug) {
      return `https://www.miruro.tv/search?q=${encodeURIComponent(title)}&ep=${episode}`;
    }

    return watchBase;
  },

  /**
   * Miruro serves its embeddable player from strm.cx (no X-Frame-Options).
   * Host/type query params deep-link Sun (icarus) / Bee (anikoto) + sub/dub.
   */
  buildMiruroPlayerEmbedUrl(
    title: string,
    episode: number,
    host: 'icarus' | 'anikoto',
    type: 'sub' | 'dub',
    scrapedWatchUrl?: string
  ) {
    const watchUrl = this.buildMiruroWatchUrl(title, episode, scrapedWatchUrl);
    const embed = new URL('https://strm.cx/');
    embed.searchParams.set('embed', '1');
    embed.searchParams.set('host', host);
    embed.searchParams.set('type', type);
    embed.searchParams.set('ep', String(episode));
    embed.searchParams.set('title', title);
    embed.searchParams.set('src', watchUrl);
    return embed.toString();
  },

  /**
   * Get available streaming servers/sources for a specific anime episode
   */
  async getStreamingSources(animeId: number, episode: number) {
    const cacheKey = `streaming_sources_v2_${animeId}_${episode}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get anime details for title + any known Miruro watch link
      let title = 'Anime';
      let scrapedMiruroUrl = '';
      try {
        const details: any = await this.getAnimeDetails(animeId);
        title = details?.data?.title || details?.data?.title_english || 'Anime';
        scrapedMiruroUrl = details?.data?.miruro_url || '';
      } catch {
        // Fallback
      }

      // Enrich with live Miruro trending watch URLs when title matches
      if (!scrapedMiruroUrl || scrapedMiruroUrl.includes('/search')) {
        try {
          const miruroItems = await this.scrapeMiruroTrending();
          const match = miruroItems.find(
            (item) =>
              item.name.toLowerCase() === title.toLowerCase() ||
              item.watchUrl.toLowerCase().includes(
                title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              )
          );
          if (match?.watchUrl) scrapedMiruroUrl = match.watchUrl;
        } catch {
          // optional enrichment
        }
      }

      const miruroWatchUrl = this.buildMiruroWatchUrl(title, episode, scrapedMiruroUrl);
      const miruroSearchUrl = `https://www.miruro.tv/search?q=${encodeURIComponent(title)}`;
      const vidsrcEmbedUrl = `https://vidsrc.me/embed/anime?id=${animeId}&ep=${episode}`;
      const twoEmbedUrl = `https://2embed.cc/embed/anime/${animeId}/${episode}`;

      const miruroSunEmbed = this.buildMiruroPlayerEmbedUrl(
        title,
        episode,
        'icarus',
        'sub',
        scrapedMiruroUrl
      );
      const miruroSunDubEmbed = this.buildMiruroPlayerEmbedUrl(
        title,
        episode,
        'icarus',
        'dub',
        scrapedMiruroUrl
      );
      const miruroBeeEmbed = this.buildMiruroPlayerEmbedUrl(
        title,
        episode,
        'anikoto',
        'sub',
        scrapedMiruroUrl
      );
      const miruroBeeDubEmbed = this.buildMiruroPlayerEmbedUrl(
        title,
        episode,
        'anikoto',
        'dub',
        scrapedMiruroUrl
      );

      // Streaming servers: In-app iframe players (VidSrc/2Embed + Miruro strm.cx player)
      const servers = [
        {
          id: 'vidsrc-embed',
          name: 'VidSrc HD',
          label: 'In-App Player (1080p)',
          type: 'sub' as const,
          quality: '1080p',
          isEmbeddable: true,
          embedUrl: vidsrcEmbedUrl,
          url: vidsrcEmbedUrl,
          active: true
        },
        {
          id: '2embed',
          name: '2Embed Multi',
          label: 'In-App Player (Multi-Host)',
          type: 'sub' as const,
          quality: '1080p',
          isEmbeddable: true,
          embedUrl: twoEmbedUrl,
          url: twoEmbedUrl,
          active: true
        },
        {
          id: 'icarus-sub',
          name: 'Miruro Sun',
          label: 'In-App Player (Icarus)',
          type: 'sub' as const,
          quality: '1080p',
          isEmbeddable: true,
          embedUrl: miruroSunEmbed,
          url: miruroWatchUrl,
          active: true
        },
        {
          id: 'icarus-dub',
          name: 'Miruro Sun (Dub)',
          label: 'In-App Player (Icarus Dub)',
          type: 'dub' as const,
          quality: '1080p',
          isEmbeddable: true,
          embedUrl: miruroSunDubEmbed,
          url: miruroWatchUrl,
          active: true
        },
        {
          id: 'anikoto-sub',
          name: 'Miruro Bee',
          label: 'In-App Player (Anikoto)',
          type: 'sub' as const,
          quality: '1080p',
          isEmbeddable: true,
          embedUrl: miruroBeeEmbed,
          url: miruroWatchUrl,
          active: true
        },
        {
          id: 'anikoto-dub',
          name: 'Miruro Bee (Dub)',
          label: 'In-App Player (Anikoto Dub)',
          type: 'dub' as const,
          quality: '1080p',
          isEmbeddable: true,
          embedUrl: miruroBeeDubEmbed,
          url: miruroWatchUrl,
          active: true
        },
        {
          id: 'animepahe-sub',
          name: 'AnimePahe',
          label: 'Backup Stream (Sub)',
          type: 'sub' as const,
          quality: '1080p / 720p',
          isEmbeddable: false,
          url: `https://animepahe.ru/?q=${encodeURIComponent(`${title} episode ${episode}`)}`,
          active: true
        },
        {
          id: 'animepahe-dub',
          name: 'AnimePahe (Dub)',
          label: 'Backup Stream (Dub)',
          type: 'dub' as const,
          quality: '1080p / 720p',
          isEmbeddable: false,
          url: `https://animepahe.ru/?q=${encodeURIComponent(`${title} dub episode ${episode}`)}`,
          active: true
        }
      ];

      const result = {
        servers,
        defaultServer: 'vidsrc-embed',
        embedUrl: vidsrcEmbedUrl,
        miruroUrl: miruroWatchUrl || miruroSearchUrl,
        animepaheUrl: `https://animepahe.ru/?q=${encodeURIComponent(title)}`,
        episode: {
          number: episode,
          animeId,
          title: `${title} - Episode ${episode}`
        }
      };

      cache.set(cacheKey, result, 1800);
      return result;
    } catch (err: any) {
      console.error(`Failed to get streaming sources for ${animeId} ep ${episode}:`, err.message);
      return {
        servers: [],
        defaultServer: '',
        embedUrl: '',
        miruroUrl: ''
      };
    }
  },

  /**
   * Get characters for an anime
   */
  async getAnimeCharacters(id: number) {
    const cacheKey = `anime_characters_v2_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const media = await this.queryAniList(ANILIST_DETAILS_QUERY, id);
      const characterNodes = media?.characters?.nodes || [];

      const characters = characterNodes.map((char: any) => ({
        character: {
          mal_id: char.id,
          url: `https://anilist.co/character/${char.id}`,
          images: {
            jpg: {
              image_url: char.image?.medium || ''
            }
          },
          name: char.name?.full || 'Unknown'
        },
        role: 'Main'
      }));

      const result = { data: characters };
      cache.set(cacheKey, result);
      return result;
    } catch {
      return { data: [] };
    }
  },

  /**
   * Get anime by genre
   */
  async getAnimeByGenre(genreName: string | number, page = 1) {
    const genreStr = typeof genreName === 'string' ? genreName : this.genreIdToName(genreName);
    const cacheKey = `anime_genre_v2_${genreStr}_${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await anilistAxios.post('', {
        query: ANILIST_PAGE_QUERY,
        variables: {
          genre: genreStr,
          page,
          perPage: 24,
          sort: ['POPULARITY_DESC']
        }
      });

      const pageData = response.data?.data?.Page;
      if (pageData && pageData.media) {
        const mappedData = pageData.media.map((item: any) => this.mapAniListToJikan(item));
        const result = {
          data: mappedData,
          pagination: {
            last_visible_page: pageData.pageInfo.lastPage,
            has_next_page: pageData.pageInfo.hasNextPage,
            current_page: pageData.pageInfo.currentPage,
            items: {
              count: mappedData.length,
              total: pageData.pageInfo.total,
              per_page: pageData.pageInfo.perPage
            }
          }
        };
        cache.set(cacheKey, result);
        return result;
      }
    } catch (err: any) {
      console.warn(`Genre query for ${genreStr} failed:`, err.message);
    }

    return { data: [] };
  },

  /**
   * Maps AniList media payload to the standard Anime interface expected by frontend
   */
  mapAniListToJikan(media: any, miruroSlugMap?: Map<string, string>) {
    const malId = media.idMal || media.id;
    const englishTitle = media.title?.english || '';
    const romajiTitle = media.title?.romaji || '';
    const nativeTitle = media.title?.native || '';
    const displayTitle = englishTitle || romajiTitle || 'Untitled Anime';

    const coverLarge =
      media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || '';
    const coverSmall = media.coverImage?.medium || coverLarge;

    // Direct Miruro watch URL if matched or fallback to Miruro search
    const matchedWatchUrl =
      miruroSlugMap?.get(displayTitle.toLowerCase()) ||
      miruroSlugMap?.get(romajiTitle.toLowerCase()) ||
      `https://www.miruro.tv/search?q=${encodeURIComponent(displayTitle)}`;

    return {
      mal_id: malId,
      url: matchedWatchUrl,
      miruro_url: matchedWatchUrl,
      images: {
        jpg: {
          image_url: coverLarge,
          small_image_url: coverSmall,
          large_image_url: coverLarge
        }
      },
      trailer: {
        youtube_id: media.trailer?.site === 'youtube' ? media.trailer.id : '',
        url: media.trailer?.site === 'youtube' ? `https://www.youtube.com/watch?v=${media.trailer.id}` : '',
        embed_url:
          media.trailer?.site === 'youtube' ? `https://www.youtube.com/embed/${media.trailer.id}` : ''
      },
      approved: true,
      titles: [
        { type: 'Default', title: displayTitle },
        { type: 'English', title: englishTitle },
        { type: 'Japanese', title: nativeTitle }
      ],
      title: displayTitle,
      title_english: englishTitle,
      title_japanese: nativeTitle,
      title_synonyms: [],
      type: media.format || 'TV',
      source: 'Original',
      episodes: media.episodes || 0,
      status:
        media.status === 'RELEASING'
          ? 'Currently Airing'
          : media.status === 'FINISHED'
          ? 'Finished Airing'
          : 'Upcoming',
      airing: media.status === 'RELEASING',
      duration: media.duration ? `${media.duration} min` : '24 min',
      score: media.averageScore ? Number((media.averageScore / 10).toFixed(1)) : 8.0,
      scored_by: media.popularity || 0,
      rank: 0,
      popularity: media.popularity || 0,
      genres: (media.genres || []).map((name: string, i: number) => ({
        mal_id: i + 1,
        type: 'anime',
        name,
        url: `/anime?genre=${encodeURIComponent(name)}`
      })),
      synopsis: media.description
        ? media.description.replace(/<[^>]+>/g, '').trim()
        : 'No synopsis available.',
      season: media.season || 'Unknown',
      year: media.seasonYear || new Date().getFullYear(),
      studios: (media.studios?.nodes || []).map((s: any) => ({
        mal_id: s.id,
        type: 'studio',
        name: s.name,
        url: ''
      }))
    };
  },

  /**
   * Maps Kitsu media payload to the standard Anime interface expected by frontend
   */
  mapKitsuToJikan(item: any) {
    const attr = item.attributes || {};
    const displayTitle = attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp || 'Untitled';
    const coverLarge = attr.posterImage?.large || attr.posterImage?.original || '';
    const coverSmall = attr.posterImage?.medium || coverLarge;
    const miruroUrl = `https://www.miruro.tv/search?q=${encodeURIComponent(displayTitle)}`;

    return {
      mal_id: parseInt(item.id, 10) || 1,
      url: miruroUrl,
      miruro_url: miruroUrl,
      images: {
        jpg: {
          image_url: coverLarge,
          small_image_url: coverSmall,
          large_image_url: coverLarge
        }
      },
      trailer: {
        youtube_id: attr.youtubeVideoId || '',
        url: attr.youtubeVideoId ? `https://www.youtube.com/watch?v=${attr.youtubeVideoId}` : '',
        embed_url: attr.youtubeVideoId ? `https://www.youtube.com/embed/${attr.youtubeVideoId}` : ''
      },
      approved: true,
      titles: [{ type: 'Default', title: displayTitle }],
      title: displayTitle,
      title_english: attr.titles?.en || displayTitle,
      title_japanese: attr.titles?.ja_jp || '',
      title_synonyms: [],
      type: (attr.subtype || 'TV').toUpperCase(),
      source: 'Original',
      episodes: attr.episodeCount || 0,
      status: attr.status === 'current' ? 'Currently Airing' : 'Finished Airing',
      airing: attr.status === 'current',
      duration: attr.episodeLength ? `${attr.episodeLength} min` : '24 min',
      score: attr.averageRating ? Number((parseFloat(attr.averageRating) / 10).toFixed(1)) : 8.0,
      scored_by: attr.userCount || 0,
      rank: 0,
      popularity: attr.userCount || 0,
      genres: [
        {
          mal_id: 1,
          type: 'anime',
          name: 'Action',
          url: '/anime?genre=Action'
        }
      ],
      synopsis: attr.synopsis ? attr.synopsis.replace(/<[^>]+>/g, '').trim() : 'No synopsis available.',
      season: 'Unknown',
      year: attr.startDate ? new Date(attr.startDate).getFullYear() : new Date().getFullYear(),
      studios: []
    };
  },

  genreIdToName(genreId: number): string {
    const map: Record<number, string> = {
      1: 'Action',
      2: 'Adventure',
      4: 'Comedy',
      8: 'Drama',
      10: 'Fantasy',
      14: 'Horror',
      22: 'Romance',
      24: 'Sci-Fi',
      30: 'Sports',
      36: 'Slice of Life',
      37: 'Supernatural'
    };
    return map[genreId] || 'Action';
  }
};
