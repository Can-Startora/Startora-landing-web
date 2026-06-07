import express from 'express';
import { getQuestions, createQuestion, createAnswer } from '../controllers/questionController.js';

const router = express.Router();

router.get('/', getQuestions);
router.post('/', createQuestion);
router.post('/:id/answers', createAnswer);

export default router;
