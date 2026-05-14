import express from 'express';
import aiService from '../services/aiService';
import databaseService from '../services/databaseService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Generate a new roadmap
router.post('/generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user?.userId;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Call Gemini to generate roadmap content
    const roadmapData = await aiService.generateRoadmap(topic);

    // Save to database
    const newRoadmap = await databaseService.createRoadmap({
      topic,
      content: roadmapData,
      userId,
    });

    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: newRoadmap,
    });
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ error: error.message || 'Failed to generate roadmap' });
  }
});

// Get user's roadmaps
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const roadmaps = await databaseService.getRoadmapsByUserId(userId);

    res.json({
      roadmaps,
    });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

export default router;
