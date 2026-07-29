import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Auth rate limiter to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

export default router;
