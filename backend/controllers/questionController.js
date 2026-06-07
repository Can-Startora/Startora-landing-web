import { getModels, loadJsonQuestions, saveJsonQuestions } from '../config/db.js';

export const getQuestions = async (req, res) => {
  const { Question, isMongoConnected } = getModels();
  if (isMongoConnected && Question) {
    try {
      const dbQuestions = await Question.find().sort({ createdAt: -1 });
      return res.json(dbQuestions);
    } catch (err) {
      console.error('MongoDB GET questions error, falling back to JSON:', err);
    }
  }

  const questions = loadJsonQuestions();
  const sortedQuestions = [...questions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedQuestions);
};

export const createQuestion = async (req, res) => {
  const { Question, isMongoConnected } = getModels();
  const { text, askedBy } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Question text is required' });
  }

  const newQuestion = {
    id: Date.now().toString(),
    text,
    askedBy: askedBy || '@anonymous',
    createdAt: new Date().toISOString(),
    answers: []
  };

  if (isMongoConnected && Question) {
    try {
      const doc = new Question(newQuestion);
      await doc.save();
      return res.status(201).json(doc);
    } catch (err) {
      console.error('MongoDB POST question error, falling back to JSON:', err);
    }
  }

  const questions = loadJsonQuestions();
  questions.push(newQuestion);
  saveJsonQuestions(questions);
  res.status(201).json(newQuestion);
};

export const createAnswer = async (req, res) => {
  const { Question, isMongoConnected } = getModels();
  const { id } = req.params;
  const { text, answeredBy } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Answer text is required' });
  }

  const newAnswer = {
    id: Date.now().toString(),
    text,
    answeredBy: answeredBy || '@anonymous',
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && Question) {
    try {
      const updatedDoc = await Question.findOneAndUpdate(
        { id: id },
        { $push: { answers: newAnswer } },
        { new: true }
      );
      if (updatedDoc) {
        return res.status(201).json(updatedDoc);
      }
    } catch (err) {
      console.error('MongoDB POST answer error, falling back to JSON:', err);
    }
  }

  const questions = loadJsonQuestions();
  const index = questions.findIndex(q => q.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Question not found' });
  }

  questions[index].answers.push(newAnswer);
  saveJsonQuestions(questions);
  res.status(201).json(questions[index]);
};
