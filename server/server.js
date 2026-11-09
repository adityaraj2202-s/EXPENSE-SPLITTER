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

// 2. Create a new group
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

// ==========================================
// DAY 7: Expense Creation & Split Allocations
// ==========================================

// 1. Create an expense and split it among group members
app.post('/api/groups/:groupId/expenses', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const { description, amount, category = 'General', splitUserIds } = req.body;

  if (!description || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Valid description and positive amount are required.' });
  }

  if (!Array.isArray(splitUserIds) || splitUserIds.length === 0) {
    return res.status(400).json({ error: 'splitUserIds must be a non-empty array of user IDs.' });
  }

  try {
    const membership = db.prepare(`
      SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?
    `).get(groupId, req.user.userId);

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this group.' });
    }

    const placeholders = splitUserIds.map(() => '?').join(',');
    const validMembers = db.prepare(`
      SELECT user_id FROM group_members
      WHERE group_id = ? AND user_id IN (${placeholders})
    `).all(groupId, ...splitUserIds);

    if (validMembers.length !== splitUserIds.length) {
      return res.status(400).json({ error: 'One or more split users are not in this group.' });
    }

    const recordExpenseTx = db.transaction(() => {
      const expenseInsert = db.prepare(`
        INSERT INTO expenses (group_id, paid_by_id, description, amount, category)
        VALUES (?, ?, ?, ?, ?)
      `);
      const expenseResult = expenseInsert.run(
        groupId,
        req.user.userId,
        description.trim(),
        amount,
        category.trim()
      );
      const expenseId = expenseResult.lastInsertRowid;

      const baseShare = Math.floor((amount / splitUserIds.length) * 100) / 100;
      let remainder = Math.round((amount - baseShare * splitUserIds.length) * 100) / 100;

      const splitInsert = db.prepare(`
        INSERT INTO expense_splits (expense_id, user_id, share_amount)
        VALUES (?, ?, ?)
      `);

      for (let i = 0; i < splitUserIds.length; i++) {
        const userId = splitUserIds[i];
        let share = baseShare;
        if (remainder > 0) {
          share = Math.round((share + 0.01) * 100) / 100;
          remainder = Math.round((remainder - 0.01) * 100) / 100;
        }
        splitInsert.run(expenseId, userId, share);
      }

      return expenseId;
    });

    const expenseId = recordExpenseTx();

    res.status(201).json({
      message: 'Expense created and split successfully',
      expenseId,
      groupId,
      paidById: req.user.userId,
      amount,
      description: description.trim(),
      splitCount: splitUserIds.length
    });
  } catch (error) {
    console.error('Error logging expense:', error);
    res.status(500).json({ error: 'Failed to record expense.' });
  }
});

// 2. Fetch all expenses and their breakdown for a group
app.get('/api/groups/:groupId/expenses', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);

  try {
    const membership = db.prepare(`
      SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?
    `).get(groupId, req.user.userId);

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this group.' });
    }

    const expenses = db.prepare(`
      SELECT e.id, e.description, e.amount, e.category, e.paid_by_id, u.name AS paid_by_name, e.created_at
      FROM expenses e
      JOIN users u ON e.paid_by_id = u.id
      WHERE e.group_id = ?
      ORDER BY e.created_at DESC
    `).all(groupId);

    const getSplits = db.prepare(`
      SELECT es.user_id, u.name AS user_name, es.share_amount
      FROM expense_splits es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = ?
    `);

    const detailedExpenses = expenses.map(expense => ({
      ...expense,
      splits: getSplits.all(expense.id)
    }));

    res.status(200).json({ expenses: detailedExpenses });
  } catch (error) {
    console.error('Error fetching group expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// ==========================================
// DAY 8: Group Balances & Debt Computation
// ==========================================

app.get('/api/groups/:groupId/balances', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);

  try {
    const membership = db.prepare(`
      SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?
    `).get(groupId, req.user.userId);

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this group.' });
    }

    const members = db.prepare(`
      SELECT u.id, u.name, u.email
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
    `).all(groupId);

    const balances = {};
    members.forEach(member => {
      balances[member.id] = {
        userId: member.id,
        name: member.name,
        email: member.email,
        paid: 0,
        owed: 0,
        settledSent: 0,
        settledReceived: 0,
        netBalance: 0
      };
    });

    const paidTotals = db.prepare(`
      SELECT paid_by_id, COALESCE(SUM(amount), 0) AS total_paid
      FROM expenses
      WHERE group_id = ?
      GROUP BY paid_by_id
    `).all(groupId);

    paidTotals.forEach(row => {
      if (balances[row.paid_by_id]) {
        balances[row.paid_by_id].paid = Math.round(row.total_paid * 100) / 100;
      }
    });

    const owedTotals = db.prepare(`
      SELECT es.user_id, COALESCE(SUM(es.share_amount), 0) AS total_owed
      FROM expense_splits es
      JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ?
      GROUP BY es.user_id
    `).all(groupId);

    owedTotals.forEach(row => {
      if (balances[row.user_id]) {
        balances[row.user_id].owed = Math.round(row.total_owed * 100) / 100;
      }
    });

    const settlements = db.prepare(`
      SELECT from_user_id, to_user_id, amount
      FROM settlements
      WHERE group_id = ?
    `).all(groupId);

    settlements.forEach(s => {
      if (balances[s.from_user_id]) {
        balances[s.from_user_id].settledSent += s.amount;
      }
      if (balances[s.to_user_id]) {
        balances[s.to_user_id].settledReceived += s.amount;
      }
    });

    const summary = Object.values(balances).map(b => {
      const net = (b.paid - b.owed) + (b.settledSent - b.settledReceived);
      return {
        ...b,
        settledSent: Math.round(b.settledSent * 100) / 100,
        settledReceived: Math.round(b.settledReceived * 100) / 100,
        netBalance: Math.round(net * 100) / 100
      };
    });

    res.status(200).json({ groupId, balances: summary });
  } catch (error) {
    console.error('Error computing balances:', error);
    res.status(500).json({ error: 'Failed to compute group balances.' });
  }
});

// ==========================================
// DAY 8 (Part 2): Record a Settlement
// ==========================================

app.post('/api/groups/:groupId/settlements', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const { toUserId, amount } = req.body;

  if (!toUserId || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Valid toUserId and positive amount are required.' });
  }

  if (toUserId === req.user.userId) {
    return res.status(400).json({ error: 'Cannot record a settlement to yourself.' });
  }

  try {
    const membership = db.prepare(`
      SELECT user_id FROM group_members 
      WHERE group_id = ? AND user_id IN (?, ?)
    `).all(groupId, req.user.userId, toUserId);

    if (membership.length !== 2) {
      return res.status(400).json({ error: 'Both users must be members of the group.' });
    }

    const insertSettlement = db.prepare(`
      INSERT INTO settlements (group_id, from_user_id, to_user_id, amount)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertSettlement.run(groupId, req.user.userId, toUserId, amount);

    res.status(201).json({
      message: 'Settlement recorded successfully',
      settlement: {
        id: result.lastInsertRowid,
        groupId,
        fromUserId: req.user.userId,
        toUserId,
        amount
      }
    });
  } catch (error) {
    console.error('Error recording settlement:', error);
    res.status(500).json({ error: 'Failed to record settlement.' });
  }
});

// ==========================================
// DAY 9: Group Member Management APIs
// ==========================================

// 1. List all members in a specific group
app.get('/api/groups/:groupId/members', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);

  try {
    const membership = db.prepare(`
      SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?
    `).get(groupId, req.user.userId);

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this group.' });
    }

    const members = db.prepare(`
      SELECT u.id, u.name, u.email, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at ASC
    `).all(groupId);

    res.status(200).json({ groupId, members });
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Failed to fetch group members.' });
  }
});

// 2. Add an existing user to a group by their registered email
app.post('/api/groups/:groupId/members', authenticateToken, (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const targetEmail = email.toLowerCase().trim();

  try {
    const requesterMembership = db.prepare(`
      SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?
    `).get(groupId, req.user.userId);

    if (!requesterMembership) {
      return res.status(403).json({ error: 'You must be a member of this group to add others.' });
    }

    const targetUser = db.prepare(`
      SELECT id, name, email FROM users WHERE email = ?
    `).get(targetEmail);

    if (!targetUser) {
      return res.status(404).json({ error: 'No user registered with this email address.' });
    }

    const alreadyMember = db.prepare(`
      SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?
    `).get(groupId, targetUser.id);

    if (alreadyMember) {
      return res.status(409).json({ error: 'User is already a member of this group.' });
    }

    const insertMember = db.prepare(`
      INSERT INTO group_members (group_id, user_id)
      VALUES (?, ?)
    `);
    insertMember.run(groupId, targetUser.id);

    res.status(201).json({
      message: `${targetUser.name} added to the group successfully.`,
      member: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email
      }
    });
  } catch (error) {
    console.error('Error adding member to group:', error);
    res.status(500).json({ error: 'Failed to add member to group.' });
  }
});

// ==========================================
// Start Server (Keep at bottom)
// ==========================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});