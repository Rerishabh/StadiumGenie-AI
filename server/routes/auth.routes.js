import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerValidation, loginValidation } from '../validators/auth.validator.js';
import { register, login, me, updateProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
 
const router = express.Router();
 
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || String(60 * 60 * 1000), 10),
  max: process.env.NODE_ENV === 'development' ? 1000 : parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests',
    errors: [],
    statusCode: 429,
  },
});
 
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000), 10),
  max: process.env.NODE_ENV === 'development' ? 1000 : parseInt(process.env.AUTH_LOGIN_RATE_LIMIT_MAX || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests',
    errors: [],
    statusCode: 429,
  },
});
 
// Route order: register, login, me, profile
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);
router.get('/me', authMiddleware, me);
router.put('/profile', authMiddleware, updateProfile);
 
export default router;
