import express, { Request, Response, Router } from 'express';
import { animeService } from '../services/animeService';
import { apiLimiter } from '../middleware/rateLimit';

const router: Router = express.Router();

router.use(apiLimiter);

// Scraped live Miruro trending items
router.get('/miruro/trending', async (req: Request, res: Response) => {
  try {
    const items = await animeService.scrapeMiruroTrending();
    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape Miruro trending anime' });
  }
});

// Trending anime (Miruro-enriched + AniList/Kitsu)
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await animeService.getTrendingAnime(page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending anime' });
  }
});

// Search anime
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const data = await animeService.searchAnime(query, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

// Top rated / popular anime
router.get('/top', async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || 'airing';
    const page = parseInt(req.query.page as string) || 1;
    const data = await animeService.getTopAnime(filter, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top anime' });
  }
});

// Details of a single anime
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = await animeService.getAnimeDetails(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

// Episodes for anime with direct Miruro streaming links
router.get('/:id/episodes', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const data = await animeService.getAnimeEpisodes(id, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

// Streaming sources and servers for anime episode
router.get('/:id/episodes/:episode/servers', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const episode = parseInt(req.params.episode) || 1;
    const data = await animeService.getStreamingSources(id, episode);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streaming servers' });
  }
});

// Alias for servers
router.get('/:id/servers/:episode', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const episode = parseInt(req.params.episode) || 1;
    const data = await animeService.getStreamingSources(id, episode);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streaming servers' });
  }
});

// Characters for anime
router.get('/:id/characters', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = await animeService.getAnimeCharacters(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Anime by genre
router.get('/genre/:genreId', async (req: Request, res: Response) => {
  try {
    const genreId = req.params.genreId;
    const page = parseInt(req.query.page as string) || 1;
    const data = await animeService.getAnimeByGenre(genreId, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime by genre' });
  }
});

export default router;
