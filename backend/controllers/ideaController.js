import { getModels, loadJsonIdeas, saveJsonIdeas } from '../config/db.js';

export const getIdeas = async (req, res) => {
  const { Idea, isMongoConnected } = getModels();
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: 'Category query parameter is required' });
  }

  if (isMongoConnected && Idea) {
    try {
      const dbIdeas = await Idea.find({ category }).sort({ createdAt: -1 });
      return res.json(dbIdeas);
    } catch (err) {
      console.error('MongoDB GET ideas error, falling back to JSON:', err);
    }
  }

  const ideas = loadJsonIdeas();
  const filteredIdeas = ideas
    .filter(idea => idea.category === category)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filteredIdeas);
};

export const createIdea = async (req, res) => {
  const { Idea, isMongoConnected } = getModels();
  const { category, title, description, proposedBy } = req.body;
  if (!category || !title || !description) {
    return res.status(400).json({ error: 'Category, Title, and Description are required' });
  }

  const newIdea = {
    id: Date.now().toString(),
    category,
    title,
    description,
    proposedBy: proposedBy || '@anonymous',
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && Idea) {
    try {
      const doc = new Idea(newIdea);
      await doc.save();
      return res.status(201).json(doc);
    } catch (err) {
      console.error('MongoDB POST ideas error, falling back to JSON:', err);
    }
  }

  const ideas = loadJsonIdeas();
  ideas.push(newIdea);
  saveJsonIdeas(ideas);
  res.status(201).json(newIdea);
};
