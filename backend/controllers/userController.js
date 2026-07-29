import { getModels, loadJsonUsers, saveJsonUsers } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Basic HTML-entity sanitiser to prevent stored XSS. */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return re.test(password);
};

/** Signs and returns a JWT for the given user object. */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, githubHandle: user.githubHandle },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerUser = async (req, res) => {
  const { User, isMongoConnected } = getModels();
  let { email, githubHandle, password, skills } = req.body;

  if (!email || !githubHandle || !password) {
    return res.status(400).json({ error: 'All fields (email, githubHandle, password) are required.' });
  }

  // Validate & sanitise input
  email = email.trim().toLowerCase();
  githubHandle = sanitizeString(githubHandle.trim());

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (githubHandle.length < 2 || githubHandle.length > 39) {
    return res.status(400).json({ error: 'GitHub handle must be between 2 and 39 characters.' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  const sanitizedSkills = Array.isArray(skills)
    ? skills.slice(0, 20).map((s) => sanitizeString(String(s).trim()).slice(0, 50)).filter(Boolean)
    : [];

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: randomUUID(),
    email,
    githubHandle,
    password: hashedPassword,
    skills: sanitizedSkills,
    loginAttempts: 0,
    lockUntil: null,
  };

  // MongoDB flow
  if (isMongoConnected && User) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'A contributor with this email already exists.' });
      }
      const doc = new User(newUser);
      await doc.save();
      const { password: _, ...userResponse } = doc.toObject();
      const token = signToken(userResponse);
      return res.status(201).json({ token, user: userResponse });
    } catch (err) {
      console.error('MongoDB register user error, falling back to JSON:', err);
    }
  }

  // JSON fallback flow
  const users = loadJsonUsers();
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'A contributor with this email already exists.' });
  }
  users.push(newUser);
  saveJsonUsers(users);

  const { password: _, ...userResponse } = newUser;
  const token = signToken(userResponse);
  res.status(201).json({ token, user: userResponse });
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUser = async (req, res) => {
  const { User, isMongoConnected } = getModels();
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  email = email.trim().toLowerCase();

  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  const MAX_ATTEMPTS = 5;

  // MongoDB Auth flow
  if (isMongoConnected && User) {
    try {
      const user = await User.findOne({ email });

      const sendInvalidCredentialsError = async (targetUser) => {
        if (targetUser) {
          targetUser.loginAttempts += 1;
          if (targetUser.loginAttempts >= MAX_ATTEMPTS) {
            targetUser.lockUntil = new Date(Date.now() + LOCK_TIME);
          }
          await targetUser.save();
        }
        return res.status(401).json({ error: 'Invalid email or password.' });
      };

      if (!user) {
        // Prevent timing attacks — always do a bcrypt compare
        await bcrypt.compare(password, '$2b$12$UnrealPasswordHashToPreventTimingAttackDummyValue');
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (user.lockUntil && user.lockUntil > Date.now()) {
        const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
        return res.status(403).json({
          error: `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return await sendInvalidCredentialsError(user);

      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      const { password: _, ...userResponse } = user.toObject();
      const token = signToken(userResponse);
      return res.json({ message: 'Login successful', token, user: userResponse });
    } catch (err) {
      console.error('MongoDB login error, falling back to JSON:', err);
    }
  }

  // JSON fallback flow
  const users = loadJsonUsers();
  const userIndex = users.findIndex((u) => u.email === email);

  const sendInvalidCredentialsJson = (idx) => {
    if (idx !== -1) {
      users[idx].loginAttempts += 1;
      if (users[idx].loginAttempts >= MAX_ATTEMPTS) {
        users[idx].lockUntil = Date.now() + LOCK_TIME;
      }
      saveJsonUsers(users);
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  };

  if (userIndex === -1) {
    const salt = await bcrypt.genSalt(12);
    await bcrypt.hash(password, salt);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const user = users[userIndex];

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(403).json({
      error: `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return sendInvalidCredentialsJson(userIndex);

  users[userIndex].loginAttempts = 0;
  users[userIndex].lockUntil = null;
  saveJsonUsers(users);

  const { password: _, ...userResponse } = user;
  const token = signToken(userResponse);
  res.json({ message: 'Login successful', token, user: userResponse });
};
