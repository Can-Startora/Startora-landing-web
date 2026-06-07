import express from 'express';
import { getSuggestions, createSuggestion, voteSuggestion } from '../controllers/suggestionController.js';

const router = express.Router();

router.get('/', getSuggestions);
router.post('/', createSuggestion);
router.post('/:id/vote', voteSuggestion);

export default router;
