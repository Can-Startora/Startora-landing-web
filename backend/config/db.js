import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON DB Files are kept at the project root for persistence/compatibility
export const DB_FILE = path.resolve(__dirname, '../../suggestions.json');
export const IDEAS_FILE = path.resolve(__dirname, '../../ideas.json');
export const QUESTIONS_FILE = path.resolve(__dirname, '../../questions.json');

// JSON database operations helpers
export const loadJsonSuggestions = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading JSON suggestions:', err);
    return [];
  }
};

export const saveJsonSuggestions = (suggestions) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(suggestions, null, 2));
  } catch (err) {
    console.error('Error saving JSON suggestions:', err);
  }
};

export const loadJsonIdeas = () => {
  try {
    if (!fs.existsSync(IDEAS_FILE)) {
      fs.writeFileSync(IDEAS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(IDEAS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading JSON ideas:', err);
    return [];
  }
};

export const saveJsonIdeas = (ideas) => {
  try {
    fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));
  } catch (err) {
    console.error('Error saving JSON ideas:', err);
  }
};

export const loadJsonQuestions = () => {
  try {
    if (!fs.existsSync(QUESTIONS_FILE)) {
      fs.writeFileSync(QUESTIONS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(QUESTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading JSON questions:', err);
    return [];
  }
};

export const saveJsonQuestions = (questions) => {
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  } catch (err) {
    console.error('Error saving JSON questions:', err);
  }
};

// Database state exports that get populated during connectDB()
export let isMongoConnected = false;
export let Suggestion;
export let Idea;
export let Question;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/startora';
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    isMongoConnected = true;
    console.log('MongoDB connection successful!');

    // Define Schemas & Models
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

    const ideaSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      category: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      proposedBy: { type: String, default: '@anonymous' },
      createdAt: { type: Date, default: Date.now }
    });
    Idea = mongoose.model('Idea', ideaSchema);

    const questionSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      text: { type: String, required: true },
      askedBy: { type: String, default: '@anonymous' },
      createdAt: { type: Date, default: Date.now },
      answers: [
        {
          id: { type: String, required: true },
          text: { type: String, required: true },
          answeredBy: { type: String, default: '@anonymous' },
          createdAt: { type: Date, default: Date.now }
        }
      ]
    });
    Question = mongoose.model('Question', questionSchema);

  } catch (err) {
    console.warn('MongoDB connection failed. Falling back gracefully to JSON file storage.');
    console.warn(`Reason: ${err.message}`);
    isMongoConnected = false;
  }
};

// Helper getter function to access models safely
export const getModels = () => {
  return { Suggestion, Idea, Question, isMongoConnected };
};
