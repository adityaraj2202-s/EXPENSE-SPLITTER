import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.send('Expense Splitter API is running');
});

// Health check endpoint (Day 3 Deliverable)
app.get('/health', (req, res) => {
  try {
    const test = db.prepare('SELECT 1 as ok').get();
    if (test && test.ok === 1) {
      res.status(200).json({ status: 'OK', database: 'connected' });
    } else {
      res.status(500).json({ status: 'ERROR', database: 'query failed' });
    }
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// ==========================================
// DAY 4: User Authentication - Signup Route
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate incoming data
  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Missing required fields: name, email, and password are required.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters long.'
    });
  }

  try {
    // 2. Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // 3. Hash the password with bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insert the new user into SQLite
    const insertQuery = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `);

    const result = insertQuery.run(name.trim(), email.toLowerCase().trim(), passwordHash);

    // 5. Respond with created user data (excluding password)
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.lastInsertRowid,
        name: name.trim(),
        email: email.toLowerCase().trim()
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});