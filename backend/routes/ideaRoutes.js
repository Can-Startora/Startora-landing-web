import express from 'express';
import { getIdeas, createIdea } from '../controllers/ideaController.js';

const router = express.Router();

router.get('/', getIdeas);
router.post('/', createIdea);

export default router;
