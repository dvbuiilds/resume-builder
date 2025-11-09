import crypto from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const MAX_RESUMES_PER_USER = 4;
const MAX_TRANSFORM_USAGE = 4;

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

  CREATE TABLE IF NOT EXISTS user_resumes (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    resumeId TEXT NOT NULL,
    data TEXT NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, resumeId)
  );

  CREATE INDEX IF NOT EXISTS idx_user_resumes_user ON user_resumes(userId, updatedAt);

  CREATE TABLE IF NOT EXISTS user_usage (
    userId TEXT PRIMARY KEY,
    transformUsage INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
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

  getUserResumes: (
    userId: string,
  ): Array<{
    id: string;
    resumeId: string;
    data: string;
    updatedAt: number;
  }> => {
    const stmt = db.prepare(
      'SELECT id, resumeId, data, updatedAt FROM user_resumes WHERE userId = ? ORDER BY updatedAt DESC LIMIT ?',
    );
    return stmt.all(userId, MAX_RESUMES_PER_USER) as Array<{
      id: string;
      resumeId: string;
      data: string;
      updatedAt: number;
    }>;
  },

  upsertUserResume: (
    userId: string,
    options: { resumeRowId?: string; resumeId: string; data: string },
  ): void => {
    const now = Date.now();

    const existingStmt = db.prepare(
      'SELECT id FROM user_resumes WHERE userId = ? AND resumeId = ?',
    );
    const existing = existingStmt.get(userId, options.resumeId) as
      | { id: string }
      | undefined;

    const upsert = db.transaction(() => {
      if (existing) {
        const updateStmt = db.prepare(
          'UPDATE user_resumes SET data = ?, updatedAt = ? WHERE id = ?',
        );
        updateStmt.run(options.data, now, existing.id);
      } else {
        const insertStmt = db.prepare(
          'INSERT INTO user_resumes (id, userId, resumeId, data, updatedAt) VALUES (?, ?, ?, ?, ?)',
        );
        const rowId = options.resumeRowId ?? crypto.randomUUID();
        insertStmt.run(rowId, userId, options.resumeId, options.data, now);
      }

      const rows = db
        .prepare(
          'SELECT id FROM user_resumes WHERE userId = ? ORDER BY updatedAt DESC',
        )
        .all(userId) as Array<{ id: string }>;

      if (rows.length > MAX_RESUMES_PER_USER) {
        const idsToDelete = rows
          .slice(MAX_RESUMES_PER_USER)
          .map((row) => row.id);
        const deleteStmt = db.prepare(
          `DELETE FROM user_resumes WHERE id IN (${idsToDelete
            .map(() => '?')
            .join(',')})`,
        );
        deleteStmt.run(...idsToDelete);
      }
    });

    upsert();
  },

  getTransformUsage: (userId: string): number => {
    const stmt = db.prepare(
      'SELECT transformUsage FROM user_usage WHERE userId = ?',
    );
    const row = stmt.get(userId) as { transformUsage: number } | undefined;
    return row?.transformUsage ?? 0;
  },

  incrementTransformUsage: (userId: string) => {
    const upsert = db.prepare(`
      INSERT INTO user_usage (userId, transformUsage)
      VALUES (?, 1)
      ON CONFLICT(userId)
      DO UPDATE SET transformUsage = transformUsage + 1
    `);
    upsert.run(userId);
  },

  maxTransformUsage: MAX_TRANSFORM_USAGE,

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
