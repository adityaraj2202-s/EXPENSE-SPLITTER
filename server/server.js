import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { authenticateToken } from './authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

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
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertQuery = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `);

    const result = insertQuery.run(name.trim(), email.toLowerCase().trim(), passwordHash);

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

// ==========================================
// DAY 5: User Authentication - Login Route
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ==========================================
// DAY 6: Protected Routes & Group Endpoints
// ==========================================

// 1. Get current logged-in user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// 2. Create a new group (matches db.js schema)
app.post('/api/groups', authenticateToken, (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Group name is required.' });
  }

  try {
    const createGroupTx = db.transaction(() => {
      const groupInsert = db.prepare(`
        INSERT INTO groups (name, created_by_id)
        VALUES (?, ?)
      `);
      const groupResult = groupInsert.run(name.trim(), req.user.userId);
      const groupId = groupResult.lastInsertRowid;

      const memberInsert = db.prepare(`
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
      `);
      memberInsert.run(groupId, req.user.userId);

      return groupId;
    });

    const groupId = createGroupTx();

    res.status(201).json({
      message: 'Group created successfully',
      group: {
        id: groupId,
        name: name.trim(),
        created_by_id: req.user.userId
      }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group.' });
  }
});

// 3. Get all groups belonging to the logged-in user
app.get('/api/groups', authenticateToken, (req, res) => {
  try {
    const groups = db.prepare(`
      SELECT g.id, g.name, g.created_by_id, g.created_at
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `).all(req.user.userId);

    res.status(200).json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});