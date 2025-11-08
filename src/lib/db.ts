import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// Get database path from environment or use default
const dbPath =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), 'data', 'database.sqlite');

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT,
    image TEXT,
    createdAt INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

export interface User {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  image: string | null;
  createdAt: number;
}

// Database operations
export const dbOperations = {
  // Create a new user
  createUser: (user: {
    id: string;
    email: string;
    password: string | null;
    name?: string | null;
    image?: string | null;
  }): User => {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, image, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    stmt.run(
      user.id,
      user.email,
      user.password,
      user.name || null,
      user.image || null,
      now,
    );

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name || null,
      image: user.image || null,
      createdAt: now,
    };
  },

  // Find user by email
  findUserByEmail: (email: string): User | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as User | undefined;
    return row || null;
  },

  // Find user by ID
  findUserById: (id: string): User | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as User | undefined;
    return row || null;
  },

  // Update user
  updateUser: (
    id: string,
    updates: {
      email?: string;
      name?: string;
      image?: string;
      password?: string | null;
    },
  ): User | null => {
    const user = dbOperations.findUserById(id);
    if (!user) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.image !== undefined) {
      fields.push('image = ?');
      values.push(updates.image);
    }
    if (updates.password !== undefined) {
      fields.push('password = ?');
      values.push(updates.password);
    }

    if (fields.length === 0) return user;

    values.push(id);
    const stmt = db.prepare(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    );
    stmt.run(...values);

    return dbOperations.findUserById(id);
  },
};

export default db;
