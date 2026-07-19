import express from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { chat } from '../controllers/ai.controller.js';

const router = express.Router();

// Rate-limit AI chat to prevent abuse and runaway API costs
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: process.env.NODE_ENV === 'development' ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a moment before trying again.',
    errors: [],
    statusCode: 429,
  },
});

// POST /api/v1/ai/chat — authenticated users only
router.post('/chat', authMiddleware, aiLimiter, chat);

export default router;
