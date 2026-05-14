import express from 'express';
import { authenticateToken } from '../middleware/auth';
import aiService from '../services/aiService';

const router = express.Router();

// Generate a quiz via AI
router.post('/generate', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { topic, previousQuestions, difficulty, tutorContext } = req.body;
    
    if (!topic) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const quiz = await aiService.generateQuiz(topic, previousQuestions || [], difficulty || 'Medium', tutorContext);
    
    res.json({
      success: true,
      quiz
    });
  } catch (error: any) {
    console.error('Error in /generate-quiz:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate quiz',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
