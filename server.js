import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'suggestions.json');
const IDEAS_FILE = path.join(__dirname, 'ideas.json');
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');

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

const loadJsonIdeas = () => {
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

const saveJsonIdeas = (ideas) => {
  try {
    fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));
  } catch (err) {
    console.error('Error saving JSON ideas:', err);
  }
};

const loadJsonQuestions = () => {
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

const saveJsonQuestions = (questions) => {
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  } catch (err) {
    console.error('Error saving JSON questions:', err);
  }
};

// MongoDB Database Operations
let isMongoConnected = false;
let Suggestion;
let Idea;
let Question;

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
app.get('/api/questions', async (req, res) => {
  if (isMongoConnected) {
    try {
      const dbQuestions = await Question.find().sort({ createdAt: -1 });
      return res.json(dbQuestions);
    } catch (err) {
      console.error('MongoDB GET questions error, falling back to JSON:', err);
    }
  }

  // JSON Fallback
  const questions = loadJsonQuestions();
  const sortedQuestions = [...questions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedQuestions);
});

app.post('/api/questions', async (req, res) => {
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

  if (isMongoConnected) {
    try {
      const doc = new Question(newQuestion);
      await doc.save();
      return res.status(201).json(doc);
    } catch (err) {
      console.error('MongoDB POST question error, falling back to JSON:', err);
    }
  }

  // JSON Fallback
  const questions = loadJsonQuestions();
  questions.push(newQuestion);
  saveJsonQuestions(questions);
  res.status(201).json(newQuestion);
});

app.post('/api/questions/:id/answers', async (req, res) => {
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

  if (isMongoConnected) {
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

  // JSON Fallback
  const questions = loadJsonQuestions();
  const index = questions.findIndex(q => q.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Question not found' });
  }

  questions[index].answers.push(newAnswer);
  saveJsonQuestions(questions);
  res.status(201).json(questions[index]);
});

app.get('/api/ideas', async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: 'Category query parameter is required' });
  }

  if (isMongoConnected) {
    try {
      const dbIdeas = await Idea.find({ category }).sort({ createdAt: -1 });
      return res.json(dbIdeas);
    } catch (err) {
      console.error('MongoDB GET ideas error, falling back to JSON:', err);
    }
  }

  // JSON Fallback
  const ideas = loadJsonIdeas();
  const filteredIdeas = ideas
    .filter(idea => idea.category === category)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filteredIdeas);
});

app.post('/api/ideas', async (req, res) => {
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

  if (isMongoConnected) {
    try {
      const doc = new Idea(newIdea);
      await doc.save();
      return res.status(201).json(doc);
    } catch (err) {
      console.error('MongoDB POST ideas error, falling back to JSON:', err);
    }
  }

  // JSON Fallback
  const ideas = loadJsonIdeas();
  ideas.push(newIdea);
  saveJsonIdeas(ideas);
  res.status(201).json(newIdea);
});

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

app.get('/api/repo-stats', async (req, res) => {
  try {
    const repoRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora', {
      headers: { 'User-Agent': 'Startora-App' }
    });
    const contribsRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora/contributors', {
      headers: { 'User-Agent': 'Startora-App' }
    });
    
    let stargazers = 0;
    let forks = 0;
    let openIssues = 0;
    let contributorsList = [];

    if (repoRes.ok) {
      const repoData = await repoRes.json();
      stargazers = repoData.stargazers_count;
      forks = repoData.forks_count;
      openIssues = repoData.open_issues_count;
    }
    if (contribsRes.ok) {
      contributorsList = await contribsRes.json();
    }

    let commitsCount = 0;
    try {
      commitsCount = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);
    } catch (e) {
      commitsCount = 6;
    }

    let contributors = [];
    if (Array.isArray(contributorsList) && contributorsList.length > 0) {
      contributors = contributorsList.map(c => ({
        name: c.login === 'Manvikamboz' ? 'Manvi Kamboz' : c.login,
        handle: c.login,
        avatar: c.avatar_url,
        role: c.login === 'Manvikamboz' ? 'Lead Architect' : 'Contributor',
        university: c.login === 'Manvikamboz' ? 'Founder & Lead' : 'GitHub Builder',
        contributions: c.contributions
      }));
    } else {
      contributors = [
        {
          name: "Manvi Kamboz",
          handle: "Manvikamboz",
          avatar: "https://avatars.githubusercontent.com/u/178479748?v=4",
          role: "Lead Architect",
          university: "Founder & Lead",
          contributions: 1
        }
      ];
    }

    let recentCommits = [];
    try {
      const gitCommitsRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora/commits?per_page=5', {
        headers: { 'User-Agent': 'Startora-App' }
      });
      if (gitCommitsRes.ok) {
        const githubCommits = await gitCommitsRes.json();
        if (Array.isArray(githubCommits)) {
          recentCommits = githubCommits.slice(0, 5).map(c => ({
            sha: c.sha.substring(0, 7),
            author: c.commit.author.name,
            message: c.commit.message.split('\n')[0],
            date: c.commit.author.date
          }));
        }
      }
    } catch (err) {
      console.warn('GitHub commits API failed, falling back to local git history:', err);
    }

    if (recentCommits.length === 0) {
      try {
        const gitLog = execSync('git log -n 5 --pretty=format:"%h|%an|%ar|%s"').toString().trim();
        recentCommits = gitLog.split('\n').map(line => {
          const [sha, author, date, message] = line.split('|');
          return { sha, author, date, message };
        });
      } catch (e) {
        recentCommits = [
          { sha: "09aa6c4", author: "Manvi Kamboz", date: "just now", message: "update contributor constellation with dynamic github api repo-stats" }
        ];
      }
    }

    let openIssuesList = [];
    try {
      const issuesRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora/issues?state=open&per_page=3', {
        headers: { 'User-Agent': 'Startora-App' }
      });
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        if (Array.isArray(issuesData)) {
          // Filter out pull requests (they have pull_request property)
          openIssuesList = issuesData
            .filter(issue => !issue.pull_request)
            .map(issue => ({
              number: issue.number,
              title: issue.title,
              url: issue.html_url,
              labels: issue.labels.map(l => l.name),
              comments: issue.comments,
              updatedAt: issue.updated_at
            }));
        }
      }
    } catch (err) {
      console.warn('GitHub issues API fetch failed:', err);
    }

    res.json({
      stargazers,
      forks,
      openIssues,
      commitsCount,
      contributorsCount: contributors.length,
      contributors,
      recentCommits,
      openIssuesList
    });
  } catch (err) {
    console.error('Error fetching repo stats:', err);
    let commitsCount = 6;
    let recentCommits = [];
    try {
      commitsCount = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);
      const gitLog = execSync('git log -n 5 --pretty=format:"%h|%an|%ar|%s"').toString().trim();
      recentCommits = gitLog.split('\n').map(line => {
        const [sha, author, date, message] = line.split('|');
        return { sha, author, date, message };
      });
    } catch (e) {
      recentCommits = [
        { sha: "09aa6c4", author: "Manvi Kamboz", date: "just now", message: "update contributor constellation with dynamic github api repo-stats" }
      ];
    }

    res.json({
      stargazers: 0,
      forks: 0,
      openIssues: 0,
      commitsCount,
      contributorsCount: 1,
      contributors: [
        {
          name: "Manvi Kamboz",
          handle: "Manvikamboz",
          avatar: "https://avatars.githubusercontent.com/u/178479748?v=4",
          role: "Lead Architect",
          university: "Founder & Lead",
          contributions: 1
        }
      ],
      recentCommits
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
