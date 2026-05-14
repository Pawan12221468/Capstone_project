import express, { Response } from 'express';
import databaseService from '../services/databaseService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/progress — get all roadmap progress for the current user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const records = await databaseService.getProgressByUserId(userId);

    // Enrich each record with computed percentage
    const enriched = records.map((rec: any) => {
      const content = rec.roadmap.content as any;
      const totalTopics: number = content?.phases?.reduce(
        (acc: number, p: any) => acc + (p.topics?.length ?? 0), 0
      ) ?? 0;
      const completed: string[] = Array.isArray(rec.completedTopics) ? rec.completedTopics : [];
      const percent = totalTopics > 0 ? Math.round((completed.length / totalTopics) * 100) : 0;

      return {
        roadmapId: rec.roadmapId,
        topic: rec.roadmap.topic,
        completedTopics: completed,
        totalTopics,
        percent,
        lastActivityAt: rec.lastActivityAt,
      };
    });

    res.json({ progress: enriched });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// GET /api/progress/:roadmapId — get progress for a specific roadmap
router.get('/:roadmapId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const record = await databaseService.getProgressByRoadmap(roadmapId, userId);
    const completed: string[] = record && Array.isArray(record.completedTopics)
      ? (record.completedTopics as string[])
      : [];

    res.json({ roadmapId, completedTopics: completed });
  } catch (error) {
    console.error('Get roadmap progress error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap progress' });
  }
});

// POST /api/progress/:roadmapId — save completed topics for a roadmap
router.post('/:roadmapId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { roadmapId } = req.params;
    const { completedTopics } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!Array.isArray(completedTopics)) {
      return res.status(400).json({ error: 'completedTopics must be an array' });
    }

    const record = await databaseService.updateProgress(roadmapId, userId, completedTopics);
    res.json({ message: 'Progress saved', record });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
