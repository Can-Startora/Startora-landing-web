import express from 'express';
import { getRepoStats } from '../controllers/githubController.js';

const router = express.Router();

router.get('/repo-stats', getRepoStats);

export default router;
