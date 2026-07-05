import express, { Request, Response } from 'express';
import { mangadexService } from '../services/mangadexService';
import { apiLimiter } from '../middleware/rateLimit';

const router = express.Router();

router.use(apiLimiter);

router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = parseInt(req.query.offset as string) || 0;
    const data = await mangadexService.getTrendingManga(limit, offset);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending manga' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const data = await mangadexService.searchManga(query, limit, offset);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search manga' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = await mangadexService.getMangaDetails(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga details' });
  }
});

router.get('/:id/chapters', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const data = await mangadexService.getMangaChapters(id, limit, offset);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

router.get('/chapter/:chapterId/pages', async (req: Request, res: Response) => {
  try {
    const chapterId = req.params.chapterId;
    const data = await mangadexService.getChapterPages(chapterId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapter pages' });
  }
});

router.get('/tag/:tagId', async (req: Request, res: Response) => {
  try {
    const tagId = req.params.tagId;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = parseInt(req.query.offset as string) || 0;
    const data = await mangadexService.searchByTag(tagId, limit, offset);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga by tag' });
  }
});

router.get('/tags', async (req: Request, res: Response) => {
  try {
    const data = await mangadexService.getTags();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

export default router;
