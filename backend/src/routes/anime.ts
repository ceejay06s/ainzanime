import express, { Request, Response } from 'express';
import { jikanService } from '../services/jikanService';
import { apiLimiter } from '../middleware/rateLimit';

const router = express.Router();

router.use(apiLimiter);

router.get('/trending', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await jikanService.getTrendingAnime(page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending anime' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const data = await jikanService.searchAnime(query, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

router.get('/top', async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || 'airing';
    const page = parseInt(req.query.page as string) || 1;
    const data = await jikanService.getTopAnime(filter, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top anime' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = await jikanService.getAnimeDetails(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

router.get('/:id/episodes', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const data = await jikanService.getAnimeEpisodes(id, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

router.get('/:id/characters', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = await jikanService.getAnimeCharacters(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

router.get('/genre/:genreId', async (req: Request, res: Response) => {
  try {
    const genreId = parseInt(req.params.genreId);
    const page = parseInt(req.query.page as string) || 1;
    const data = await jikanService.getAnimeByGenre(genreId, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime by genre' });
  }
});

export default router;
