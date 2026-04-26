import crypto from 'crypto';
import path from 'path';
import { pathToFileURL } from 'url';
import { createClient, type Client, type Row } from '@libsql/client';
import { logger } from './logger';

const MAX_RESUMES_PER_USER = 4;
const MAX_TRANSFORM_USAGE = 4;
const MAX_AI_SUGGESTION_USAGE = 10;
const AI_SUGGESTION_RESET_HOURS = 24;

function createDbClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (tursoUrl) {
    return createClient({
      url: tursoUrl,
      authToken: authToken || undefined,
    });
  }
  const filePath =
    process.env.DATABASE_PATH ||
    path.join(process.cwd(), 'data', 'database.sqlite');
  return createClient({ url: pathToFileURL(filePath).href });
}

const client = createDbClient();

const SCHEMA_SQL = `
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
    deletedAt INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, resumeId)
  );

  CREATE INDEX IF NOT EXISTS idx_user_resumes_user ON user_resumes(userId, updatedAt);

  CREATE TABLE IF NOT EXISTS user_usage (
    userId TEXT PRIMARY KEY,
    transformUsage INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

async function runMigrations(): Promise<void> {
  await client.execute('PRAGMA foreign_keys = ON');
  await client.executeMultiple(SCHEMA_SQL);

  try {
    const tableInfo = await client.execute('PRAGMA table_info(user_resumes)');
    const hasDeletedAt = tableInfo.rows.some(
      (col) => String(col.name) === 'deletedAt',
    );
    if (!hasDeletedAt) {
      await client.execute(
        'ALTER TABLE user_resumes ADD COLUMN deletedAt INTEGER',
      );
    }
  } catch (err) {
    logger.warn('Migration check for deletedAt column failed:', err);
  }

  try {
    const usageTableInfo = await client.execute('PRAGMA table_info(user_usage)');
    const colNames = usageTableInfo.rows.map((col) => String(col.name));

    if (!colNames.includes('aiSuggestionUsage')) {
      await client.execute(
        'ALTER TABLE user_usage ADD COLUMN aiSuggestionUsage INTEGER NOT NULL DEFAULT 0',
      );
    }
    if (!colNames.includes('aiSuggestionLastReset')) {
      await client.execute(
        'ALTER TABLE user_usage ADD COLUMN aiSuggestionLastReset INTEGER',
      );
    }
  } catch (err) {
    logger.warn('Migration check for AI suggestion columns failed:', err);
  }
}

let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = runMigrations();
  }
  return initPromise;
}

/** Clears cached schema init so the next DB call re-runs migrations (Vitest only). */
export function __resetDbInitForTests(): void {
  initPromise = null;
}

function rowToUser(row: Row): User {
  return {
    id: String(row.id),
    email: String(row.email),
    password: row.password != null ? String(row.password) : null,
    name: row.name != null ? String(row.name) : null,
    image: row.image != null ? String(row.image) : null,
    createdAt: Number(row.createdAt),
  };
}

function rowToResumeRow(row: Row): {
  id: string;
  resumeId: string;
  data: string;
  updatedAt: number;
} {
  return {
    id: String(row.id),
    resumeId: String(row.resumeId),
    data: String(row.data),
    updatedAt: Number(row.updatedAt),
  };
}

export interface User {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  image: string | null;
  createdAt: number;
}

export const dbOperations = {
  createUser: async (user: {
    id: string;
    email: string;
    password: string | null;
    name?: string | null;
    image?: string | null;
  }): Promise<User> => {
    await ensureInitialized();
    const now = Date.now();
    await client.execute({
      sql: `
        INSERT INTO users (id, email, password, name, image, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        user.id,
        user.email,
        user.password,
        user.name ?? null,
        user.image ?? null,
        now,
      ],
    });

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name ?? null,
      image: user.image ?? null,
      createdAt: now,
    };
  },

  getUserResumes: async (
    userId: string,
  ): Promise<
    Array<{
      id: string;
      resumeId: string;
      data: string;
      updatedAt: number;
    }>
  > => {
    await ensureInitialized();
    const result = await client.execute({
      sql: `SELECT id, resumeId, data, updatedAt FROM user_resumes
            WHERE userId = ? AND (deletedAt IS NULL OR deletedAt = 0)
            ORDER BY updatedAt DESC LIMIT ?`,
      args: [userId, MAX_RESUMES_PER_USER],
    });
    return result.rows.map(rowToResumeRow);
  },

  upsertUserResume: async (
    userId: string,
    options: { resumeRowId?: string; resumeId: string; data: string },
  ): Promise<void> => {
    await ensureInitialized();
    const now = Date.now();

    logger.info('[dbOperations.upsertUserResume] Starting upsert:', {
      userId,
      resumeId: options.resumeId,
      hasRowId: !!options.resumeRowId,
    });

    const userCheck = await dbOperations.findUserById(userId);
    logger.info('[dbOperations.upsertUserResume] User verification:', {
      userId,
      userExists: !!userCheck,
      userEmail: userCheck?.email,
    });

    if (!userCheck) {
      logger.error(
        '[dbOperations.upsertUserResume] User not found in database:',
        { userId },
      );
      throw new Error(`User with id ${userId} not found in database`);
    }

    const existingResult = await client.execute({
      sql: 'SELECT id FROM user_resumes WHERE userId = ? AND resumeId = ?',
      args: [userId, options.resumeId],
    });
    const existingRow = existingResult.rows[0];
    const existing = existingRow
      ? { id: String(existingRow.id) }
      : undefined;

    logger.info('[dbOperations.upsertUserResume] Existing resume check:', {
      userId,
      resumeId: options.resumeId,
      exists: !!existing,
      existingId: existing?.id,
    });

    const tx = await client.transaction('write');
    try {
      if (existing) {
        logger.info(
          '[dbOperations.upsertUserResume] Updating existing resume:',
          {
            userId,
            resumeId: options.resumeId,
            rowId: existing.id,
          },
        );
        await tx.execute({
          sql: 'UPDATE user_resumes SET data = ?, updatedAt = ?, deletedAt = NULL WHERE id = ?',
          args: [options.data, now, existing.id],
        });
      } else {
        const rowId = options.resumeRowId ?? crypto.randomUUID();
        logger.info('[dbOperations.upsertUserResume] Inserting new resume:', {
          userId,
          resumeId: options.resumeId,
          rowId,
        });
        try {
          await tx.execute({
            sql: `INSERT INTO user_resumes (id, userId, resumeId, data, updatedAt, deletedAt)
                  VALUES (?, ?, ?, ?, ?, NULL)`,
            args: [rowId, userId, options.resumeId, options.data, now],
          });
          logger.info('[dbOperations.upsertUserResume] Insert successful:', {
            userId,
            resumeId: options.resumeId,
            rowId,
          });
        } catch (insertError) {
          logger.error('[dbOperations.upsertUserResume] Insert failed:', {
            userId,
            resumeId: options.resumeId,
            rowId,
            error: insertError,
            errorMessage:
              insertError instanceof Error
                ? insertError.message
                : String(insertError),
          });
          throw insertError;
        }
      }

      await tx.execute({
        sql: `
          UPDATE user_resumes
          SET deletedAt = ?
          WHERE userId = ?
            AND (deletedAt IS NULL OR deletedAt = 0)
            AND id NOT IN (
              SELECT id FROM user_resumes
              WHERE userId = ?
                AND (deletedAt IS NULL OR deletedAt = 0)
              ORDER BY updatedAt DESC
              LIMIT ?
            )
        `,
        args: [now, userId, userId, MAX_RESUMES_PER_USER],
      });

      await tx.commit();
      logger.info(
        '[dbOperations.upsertUserResume] Upsert completed successfully:',
        { userId, resumeId: options.resumeId },
      );
    } catch (error) {
      logger.error('[dbOperations.upsertUserResume] Upsert transaction failed:', {
        userId,
        resumeId: options.resumeId,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    } finally {
      tx.close();
    }
  },

  getTransformUsage: async (userId: string): Promise<number> => {
    await ensureInitialized();
    const result = await client.execute({
      sql: 'SELECT transformUsage FROM user_usage WHERE userId = ?',
      args: [userId],
    });
    const row = result.rows[0];
    if (!row) return 0;
    return Number(row.transformUsage ?? 0);
  },

  incrementTransformUsage: async (userId: string): Promise<void> => {
    await ensureInitialized();
    logger.info('[dbOperations.incrementTransformUsage] Starting:', { userId });

    const userCheck = await dbOperations.findUserById(userId);
    logger.info('[dbOperations.incrementTransformUsage] User verification:', {
      userId,
      userExists: !!userCheck,
      userEmail: userCheck?.email,
    });

    if (!userCheck) {
      logger.error(
        '[dbOperations.incrementTransformUsage] User not found in database:',
        { userId },
      );
      throw new Error(`User with id ${userId} not found in database`);
    }

    try {
      await client.execute({
        sql: `
          INSERT INTO user_usage (userId, transformUsage)
          VALUES (?, 1)
          ON CONFLICT(userId)
          DO UPDATE SET transformUsage = transformUsage + 1
        `,
        args: [userId],
      });
      const newUsage = await dbOperations.getTransformUsage(userId);
      logger.info(
        '[dbOperations.incrementTransformUsage] Usage incremented successfully:',
        { userId, newUsage },
      );
    } catch (error) {
      logger.error(
        '[dbOperations.incrementTransformUsage] Failed to increment usage:',
        {
          userId,
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      );
      throw error;
    }
  },

  maxTransformUsage: MAX_TRANSFORM_USAGE,

  getAISuggestionUsage: async (userId: string): Promise<number> => {
    await ensureInitialized();
    const result = await client.execute({
      sql: 'SELECT aiSuggestionUsage, aiSuggestionLastReset FROM user_usage WHERE userId = ?',
      args: [userId],
    });
    const row = result.rows[0];
    if (!row) {
      return 0;
    }

    const now = Date.now();
    const lastReset = Number(row.aiSuggestionLastReset ?? 0);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

    if (hoursSinceReset >= AI_SUGGESTION_RESET_HOURS) {
      await client.execute({
        sql: `
          UPDATE user_usage
          SET aiSuggestionUsage = 0, aiSuggestionLastReset = ?
          WHERE userId = ?
        `,
        args: [now, userId],
      });
      return 0;
    }

    return Number(row.aiSuggestionUsage ?? 0);
  },

  incrementAISuggestionUsage: async (userId: string): Promise<void> => {
    await ensureInitialized();
    const now = Date.now();
    await client.execute({
      sql: `
        INSERT INTO user_usage (userId, aiSuggestionUsage, aiSuggestionLastReset)
        VALUES (?, 1, ?)
        ON CONFLICT(userId)
        DO UPDATE SET
          aiSuggestionUsage = aiSuggestionUsage + 1,
          aiSuggestionLastReset = CASE
            WHEN aiSuggestionLastReset IS NULL OR (aiSuggestionUsage + 1 = 1) THEN ?
            ELSE aiSuggestionLastReset
          END
      `,
      args: [userId, now, now],
    });
  },

  maxAISuggestionUsage: MAX_AI_SUGGESTION_USAGE,

  deleteUserResume: async (
    userId: string,
    resumeId: string,
  ): Promise<void> => {
    await ensureInitialized();
    const verifyResult = await client.execute({
      sql: 'SELECT id FROM user_resumes WHERE userId = ? AND resumeId = ?',
      args: [userId, resumeId],
    });
    if (!verifyResult.rows[0]) {
      throw new Error('Resume not found');
    }

    const now = Date.now();
    await client.execute({
      sql: 'UPDATE user_resumes SET deletedAt = ? WHERE userId = ? AND resumeId = ?',
      args: [now, userId, resumeId],
    });
  },

  restoreUserResume: async (
    userId: string,
    resumeId: string,
  ): Promise<void> => {
    await ensureInitialized();
    const verifyResult = await client.execute({
      sql: 'SELECT id FROM user_resumes WHERE userId = ? AND resumeId = ?',
      args: [userId, resumeId],
    });
    if (!verifyResult.rows[0]) {
      throw new Error('Resume not found');
    }

    await client.execute({
      sql: 'UPDATE user_resumes SET deletedAt = NULL WHERE userId = ? AND resumeId = ?',
      args: [userId, resumeId],
    });
  },

  findUserByEmail: async (email: string): Promise<User | null> => {
    await ensureInitialized();
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email],
    });
    const row = result.rows[0];
    return row ? rowToUser(row) : null;
  },

  findUserById: async (id: string): Promise<User | null> => {
    await ensureInitialized();
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    });
    const row = result.rows[0];
    return row ? rowToUser(row) : null;
  },

  updateUser: async (
    id: string,
    updates: {
      email?: string;
      name?: string;
      image?: string;
      password?: string | null;
    },
  ): Promise<User | null> => {
    await ensureInitialized();
    const user = await dbOperations.findUserById(id);
    if (!user) return null;

    const fields: string[] = [];
    const values: (string | null)[] = [];

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
    await client.execute({
      sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      args: values as (string | null)[],
    });

    return dbOperations.findUserById(id);
  },
};
