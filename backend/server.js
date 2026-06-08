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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB (MongoDB connection with JSON fallback)
await connectDB();

// Mount API Routes
app.use('/api/questions', questionRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api', githubRoutes);

// Serve static assets from client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
