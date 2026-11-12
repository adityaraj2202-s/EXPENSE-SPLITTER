import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'expenses.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_by_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    paid_by_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT DEFAULT 'General',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expense_splits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    share_amount REAL NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

// Auto-seed initial demo accounts and data if database is brand new
try {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const u1 = insertUser.run('Aditya', 'aditya@test.com', hashedPassword).lastInsertRowid;
    const u2 = insertUser.run('Shrestha', 'shri@test.com', hashedPassword).lastInsertRowid;
    const u3 = insertUser.run('Siddharth', 'sid@test.com', hashedPassword).lastInsertRowid;
    const u4 = insertUser.run('Demo Test', 'test@test.com', hashedPassword).lastInsertRowid;

    const g1 = db.prepare('INSERT INTO groups (name, created_by_id) VALUES (?, ?)').run('Trip to Goa 🏖️', u1).lastInsertRowid;

    const addMember = db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)');
    addMember.run(g1, u1);
    addMember.run(g1, u2);
    addMember.run(g1, u3);
    addMember.run(g1, u4);

    const exp1 = db.prepare('INSERT INTO expenses (group_id, paid_by_id, description, amount, category) VALUES (?, ?, ?, ?, ?)')
      .run(g1, u1, 'Dinner at beach', 1200, 'Food & Drinks').lastInsertRowid;

    const splitStmt = db.prepare('INSERT INTO expense_splits (expense_id, user_id, share_amount) VALUES (?, ?, ?)');
    splitStmt.run(exp1, u1, 300);
    splitStmt.run(exp1, u2, 300);
    splitStmt.run(exp1, u3, 300);
    splitStmt.run(exp1, u4, 300);
    console.log('Seeded demo accounts and initial group data successfully.');
  }
} catch (seedErr) {
  console.warn('Auto-seed check skipped or failed:', seedErr.message);
}

export default db;