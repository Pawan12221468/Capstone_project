import express from 'express';
import aiService from '../services/aiService';
import databaseService from '../services/databaseService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /api/tutor/sessions — create a new tutor session for a topic
router.post('/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user?.userId;

    if (!topic || !userId) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const session = await databaseService.createTutorSession({ topic, userId });

    res.status(201).json({
      message: 'Tutor session created',
      session,
    });
  } catch (error) {
    console.error('Create tutor session error:', error);
    res.status(500).json({ error: 'Failed to create tutor session' });
  }
});

// GET /api/tutor/sessions — list user's tutor sessions
router.get('/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sessions = await databaseService.getTutorSessionsByUserId(userId);
    res.json({ sessions });
  } catch (error) {
    console.error('Get tutor sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/tutor/sessions/:sessionId — get a single session with messages
router.get('/sessions/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    const session = await databaseService.getTutorSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get tutor session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/tutor/sessions/:sessionId/chat — send a message and get AI tutor reply
router.post('/sessions/:sessionId/chat', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user?.userId;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    const session = await databaseService.getTutorSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Save user message
    const userMsg = await databaseService.addTutorMessage({
      content: message,
      role: 'user',
      sessionId,
    });

    // Build conversation history for context (latest 20 messages)
    const history = session.messages.slice(-20).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI tutor response
    const aiText = await aiService.tutorChat(message, session.topic, history);

    // Save AI response
    const aiMsg = await databaseService.addTutorMessage({
      content: aiText,
      role: 'assistant',
      sessionId,
    });

    res.json({
      message: 'Response generated',
      userMessage: userMsg,
      assistantMessage: aiMsg,
    });
  } catch (error: any) {
    console.error('Tutor chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get tutor response' });
  }
});

// DELETE /api/tutor/sessions/:sessionId — delete a session
router.delete('/sessions/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    const session = await databaseService.getTutorSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    await databaseService.deleteTutorSession(sessionId);
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete tutor session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
