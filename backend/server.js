import crypto from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import questionRoutes from './routes/questionRoutes.js';
import ideaRoutes from './routes/ideaRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rateLimit from 'express-rate-limit';

// Rate limiter for all write (POST) endpoints — 10 submissions per 15 min per IP
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this IP. Please wait 15 minutes before trying again.' }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Mount API Routes
app.use('/api/users', userRoutes);
app.use('/api/questions', writeLimiter, questionRoutes);
app.use('/api/ideas', writeLimiter, ideaRoutes);
app.use('/api/suggestions', writeLimiter, suggestionRoutes);
app.use('/api', githubRoutes);

// Serve static assets from client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Encapsulated server startup to safely handle DB connection & initialization
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database initialization encountered an unhandled error:', err);
  }

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Fatal error during server startup:', err);
  process.exit(1);
});
