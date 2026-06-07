import { getModels, loadJsonSuggestions, saveJsonSuggestions } from '../config/db.js';

export const getSuggestions = async (req, res) => {
  const { Suggestion, isMongoConnected } = getModels();
  if (isMongoConnected && Suggestion) {
    try {
      const dbSuggestions = await Suggestion.find().sort({ createdAt: 1 });
      return res.json(dbSuggestions);
    } catch (err) {
      console.error('MongoDB GET error, falling back to JSON:', err);
    }
  }
  res.json(loadJsonSuggestions());
};

export const createSuggestion = async (req, res) => {
  const { Suggestion, isMongoConnected } = getModels();
  const { title, description, proposedBy } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and Description are required' });
  }

  const newSuggestion = {
    id: Date.now().toString(),
    title,
    description,
    proposedBy: proposedBy || '@anonymous',
    votesYes: 0,
    votesNo: 0,
    status: 'active',
    voteLogs: [],
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && Suggestion) {
    try {
      const doc = new Suggestion(newSuggestion);
      await doc.save();
      return res.status(201).json(doc);
    } catch (err) {
      console.error('MongoDB POST error, falling back to JSON:', err);
    }
  }

  const suggestions = loadJsonSuggestions();
  suggestions.push(newSuggestion);
  saveJsonSuggestions(suggestions);
  res.status(201).json(newSuggestion);
};

export const voteSuggestion = async (req, res) => {
  const { Suggestion, isMongoConnected } = getModels();
  const { id } = req.params;
  const { votesYes, votesNo, status, voteLogs } = req.body;

  if (isMongoConnected && Suggestion) {
    try {
      const updatedDoc = await Suggestion.findOneAndUpdate(
        { id: id },
        { 
          $set: { 
            votesYes: typeof votesYes === 'number' ? votesYes : undefined,
            votesNo: typeof votesNo === 'number' ? votesNo : undefined,
            status: status || undefined,
            voteLogs: Array.isArray(voteLogs) ? voteLogs : undefined
          } 
        },
        { new: true, runValidators: true }
      );
      if (updatedDoc) {
        return res.json(updatedDoc);
      }
    } catch (err) {
      console.error('MongoDB VOTE error, falling back to JSON:', err);
    }
  }

  const suggestions = loadJsonSuggestions();
  const index = suggestions.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Suggestion not found' });
  }

  suggestions[index] = {
    ...suggestions[index],
    votesYes: typeof votesYes === 'number' ? votesYes : suggestions[index].votesYes,
    votesNo: typeof votesNo === 'number' ? votesNo : suggestions[index].votesNo,
    status: status || suggestions[index].status,
    voteLogs: Array.isArray(voteLogs) ? voteLogs : suggestions[index].voteLogs
  };

  saveJsonSuggestions(suggestions);
  res.json(suggestions[index]);
};
