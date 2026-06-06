import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'suggestions.json');

app.use(cors());
app.use(express.json());

// Default suggestions to seed the database/JSON file
const DEFAULT_SUGGESTIONS = [];

// JSON Database Operations (Fallback Mode)
const loadJsonSuggestions = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_SUGGESTIONS, null, 2));
      return DEFAULT_SUGGESTIONS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading JSON suggestions:', err);
    return DEFAULT_SUGGESTIONS;
  }
};

const saveJsonSuggestions = (suggestions) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(suggestions, null, 2));
  } catch (err) {
    console.error('Error saving JSON suggestions:', err);
  }
};

// MongoDB Database Operations
let isMongoConnected = false;
let Suggestion;

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/startora';

try {
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 4000 // Time out after 4 seconds
  });
  
  isMongoConnected = true;
  console.log('MongoDB connection successful!');

  // Define Schema
  const suggestionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    proposedBy: { type: String, default: '@anonymous' },
    votesYes: { type: Number, default: 0 },
    votesNo: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    voteLogs: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
  });

  Suggestion = mongoose.model('Suggestion', suggestionSchema);

  // Seed default suggestions if DB is empty
  const count = await Suggestion.countDocuments();
  if (count === 0) {
    console.log('Seeding default roadmap suggestions to MongoDB...');
    await Suggestion.insertMany(DEFAULT_SUGGESTIONS);
  }
} catch (err) {
  console.warn('MongoDB connection failed. Falling back gracefully to JSON file storage.');
  console.warn(`Reason: ${err.message}`);
  isMongoConnected = false;
}

// REST Endpoints
app.get('/api/suggestions', async (req, res) => {
  if (isMongoConnected) {
    try {
      const dbSuggestions = await Suggestion.find().sort({ createdAt: 1 });
      return res.json(dbSuggestions);
    } catch (err) {
      console.error('MongoDB GET error, falling back to JSON:', err);
    }
  }
  // JSON Fallback
  res.json(loadJsonSuggestions());
});

app.post('/api/suggestions', async (req, res) => {
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

  if (isMongoConnected) {
    try {
      const doc = new Suggestion(newSuggestion);
      await doc.save();
      return res.status(201).json(doc);
    } catch (err) {
      console.error('MongoDB POST error, falling back to JSON:', err);
    }
  }

  // JSON Fallback
  const suggestions = loadJsonSuggestions();
  suggestions.push(newSuggestion);
  saveJsonSuggestions(suggestions);
  res.status(201).json(newSuggestion);
});

app.post('/api/suggestions/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { votesYes, votesNo, status, voteLogs } = req.body;

  if (isMongoConnected) {
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

  // JSON Fallback
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
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
