import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockClient } = vi.hoisted(() => {
  const mockClient = {
    execute: vi.fn(),
    executeMultiple: vi.fn(),
    transaction: vi.fn(),
  };
  return { mockClient };
});

vi.mock("@libsql/client", () => ({
  createClient: vi.fn(() => mockClient),
}));

import { dbOperations, __resetDbInitForTests } from "@resume-builder/lib/db";

function migrationExecuteHandler() {
  return async (stmt: { sql: string } | string) => {
    const sql = typeof stmt === "string" ? stmt : stmt.sql;
    if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
    if (sql.includes("PRAGMA table_info(user_resumes)")) {
      return { rows: [{ name: "deletedAt" }] };
    }
    if (sql.includes("PRAGMA table_info(user_usage)")) {
      return {
        rows: [
          { name: "aiSuggestionUsage" },
          { name: "aiSuggestionLastReset" },
        ],
      };
    }
    return { rows: [] };
  };
}

describe("dbOperations", () => {
  beforeEach(() => {
    __resetDbInitForTests();
    vi.clearAllMocks();
    mockClient.executeMultiple.mockResolvedValue(undefined);
    mockClient.execute.mockImplementation(migrationExecuteHandler());
    mockClient.transaction.mockReset();
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("INSERT INTO users"))
            return { rows: [], rowsAffected: 1 };
          return { rows: [] };
        },
      );

      const userData = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed-password",
        name: "Test User",
        image: "https://example.com/image.jpg",
      };

      const result = await dbOperations.createUser(userData);

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("INSERT INTO users"),
          args: [
            userData.id,
            userData.email,
            userData.password,
            userData.name,
            userData.image,
            expect.any(Number),
          ],
        }),
      );
      expect(result.id).toBe(userData.id);
      expect(result.email).toBe(userData.email);
      expect(result.createdAt).toBeGreaterThan(0);
    });

    it("should handle null optional fields", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("INSERT INTO users"))
            return { rows: [], rowsAffected: 1 };
          return { rows: [] };
        },
      );

      const userData = {
        id: "user-123",
        email: "test@example.com",
        password: null,
      };

      const result = await dbOperations.createUser(userData);

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [
            userData.id,
            userData.email,
            null,
            null,
            null,
            expect.any(Number),
          ],
        }),
      );
      expect(result.name).toBeNull();
      expect(result.image).toBeNull();
    });
  });

  describe("getUserResumes", () => {
    it("should return user resumes", async () => {
      const mockResumes = [
        {
          id: "row-1",
          resumeId: "resume-1",
          data: '{"title":"Test"}',
          updatedAt: Date.now(),
        },
      ];

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (
            sql.includes(
              "SELECT id, resumeId, data, updatedAt FROM user_resumes",
            )
          ) {
            return { rows: mockResumes };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.getUserResumes("user-123");

      expect(result).toEqual(mockResumes);
      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ["user-123", 4],
        }),
      );
    });

    it("should return empty array when no resumes", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (
            sql.includes(
              "SELECT id, resumeId, data, updatedAt FROM user_resumes",
            )
          ) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.getUserResumes("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("upsertUserResume", () => {
    it("should update existing resume", async () => {
      const txExecute = vi.fn().mockResolvedValue({ rows: [] });
      const txCommit = vi.fn().mockResolvedValue(undefined);
      const txClose = vi.fn();
      mockClient.transaction.mockResolvedValue({
        execute: txExecute,
        commit: txCommit,
        close: txClose,
      });

      const userRow = {
        id: "user-123",
        email: "test@example.com",
        password: null,
        name: null,
        image: null,
        createdAt: Date.now(),
      };

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            return { rows: [userRow] };
          }
          if (sql.includes("SELECT id FROM user_resumes WHERE userId = ?")) {
            return { rows: [{ id: "row-1" }] };
          }
          return { rows: [] };
        },
      );

      await dbOperations.upsertUserResume("user-123", {
        resumeId: "resume-1",
        data: '{"title":"Updated"}',
        resumeRowId: "row-1",
      });

      expect(txExecute).toHaveBeenCalled();
      expect(txCommit).toHaveBeenCalled();
      expect(txClose).toHaveBeenCalled();
    });

    it("should insert new resume", async () => {
      const txExecute = vi.fn().mockResolvedValue({ rows: [] });
      const txCommit = vi.fn().mockResolvedValue(undefined);
      const txClose = vi.fn();
      mockClient.transaction.mockResolvedValue({
        execute: txExecute,
        commit: txCommit,
        close: txClose,
      });

      const userRow = {
        id: "user-123",
        email: "test@example.com",
        password: null,
        name: null,
        image: null,
        createdAt: Date.now(),
      };

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            return { rows: [userRow] };
          }
          if (sql.includes("SELECT id FROM user_resumes WHERE userId = ?")) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      await dbOperations.upsertUserResume("user-123", {
        resumeId: "resume-1",
        data: '{"title":"New"}',
      });

      expect(txExecute).toHaveBeenCalled();
      expect(txCommit).toHaveBeenCalled();
    });
  });

  describe("getTransformUsage", () => {
    it("should return usage count", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT transformUsage FROM user_usage")) {
            return { rows: [{ transformUsage: 3 }] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.getTransformUsage("user-123");

      expect(result).toBe(3);
    });

    it("should return 0 when no usage record exists", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT transformUsage FROM user_usage")) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.getTransformUsage("user-123");

      expect(result).toBe(0);
    });
  });

  describe("incrementTransformUsage", () => {
    it("should increment usage count", async () => {
      const userRow = {
        id: "user-123",
        email: "test@example.com",
        password: null,
        name: null,
        image: null,
        createdAt: Date.now(),
      };

      let transformSelectCount = 0;
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            return { rows: [userRow] };
          }
          if (sql.includes("INSERT INTO user_usage")) {
            return { rows: [], rowsAffected: 1 };
          }
          if (sql.includes("SELECT transformUsage FROM user_usage")) {
            transformSelectCount += 1;
            return { rows: [{ transformUsage: transformSelectCount }] };
          }
          return { rows: [] };
        },
      );

      await dbOperations.incrementTransformUsage("user-123");

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("INSERT INTO user_usage"),
          args: ["user-123"],
        }),
      );
    });
  });

  describe("getAISuggestionUsage", () => {
    it("should return usage count when within 24 hours", async () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (
            sql.includes(
              "SELECT aiSuggestionUsage, aiSuggestionLastReset FROM user_usage",
            )
          ) {
            return {
              rows: [
                {
                  aiSuggestionUsage: 5,
                  aiSuggestionLastReset: oneHourAgo,
                },
              ],
            };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.getAISuggestionUsage("user-123");

      expect(result).toBe(5);
    });

    it("should reset usage when 24 hours have passed", async () => {
      const now = Date.now();
      const twentyFiveHoursAgo = now - 25 * 60 * 60 * 1000;

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (
            sql.includes(
              "SELECT aiSuggestionUsage, aiSuggestionLastReset FROM user_usage",
            )
          ) {
            return {
              rows: [
                {
                  aiSuggestionUsage: 10,
                  aiSuggestionLastReset: twentyFiveHoursAgo,
                },
              ],
            };
          }
          if (sql.includes("UPDATE user_usage")) {
            return { rows: [], rowsAffected: 1 };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.getAISuggestionUsage("user-123");

      expect(result).toBe(0);
      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("UPDATE user_usage"),
        }),
      );
    });

    it("should return 0 when no usage record exists", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (
            sql.includes(
              "SELECT aiSuggestionUsage, aiSuggestionLastReset FROM user_usage",
            )
          ) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.getAISuggestionUsage("user-123");

      expect(result).toBe(0);
    });
  });

  describe("incrementAISuggestionUsage", () => {
    it("should increment usage and set reset time", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("INSERT INTO user_usage")) {
            return { rows: [], rowsAffected: 1 };
          }
          return { rows: [] };
        },
      );

      await dbOperations.incrementAISuggestionUsage("user-123");

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ["user-123", expect.any(Number), expect.any(Number)],
        }),
      );
    });
  });

  describe("deleteUserResume", () => {
    it("should delete resume", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT id FROM user_resumes WHERE userId = ?")) {
            return { rows: [{ id: "row-1" }] };
          }
          if (sql.includes("UPDATE user_resumes SET deletedAt")) {
            return { rows: [], rowsAffected: 1 };
          }
          return { rows: [] };
        },
      );

      await dbOperations.deleteUserResume("user-123", "resume-1");

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("UPDATE user_resumes SET deletedAt"),
        }),
      );
    });

    it("should throw error when resume not found", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT id FROM user_resumes WHERE userId = ?")) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      await expect(
        dbOperations.deleteUserResume("user-123", "resume-1"),
      ).rejects.toThrow("Resume not found");
    });
  });

  describe("restoreUserResume", () => {
    it("should restore deleted resume", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT id FROM user_resumes WHERE userId = ?")) {
            return { rows: [{ id: "row-1" }] };
          }
          if (sql.includes("UPDATE user_resumes SET deletedAt = NULL")) {
            return { rows: [], rowsAffected: 1 };
          }
          return { rows: [] };
        },
      );

      await dbOperations.restoreUserResume("user-123", "resume-1");

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining(
            "UPDATE user_resumes SET deletedAt = NULL",
          ),
        }),
      );
    });

    it("should throw error when resume not found", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT id FROM user_resumes WHERE userId = ?")) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      await expect(
        dbOperations.restoreUserResume("user-123", "resume-1"),
      ).rejects.toThrow("Resume not found");
    });
  });

  describe("findUserByEmail", () => {
    it("should find user by email", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed",
        name: "Test",
        image: null,
        createdAt: Date.now(),
      };

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE email = ?")) {
            return { rows: [mockUser] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.findUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE email = ?")) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.findUserByEmail("test@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findUserById", () => {
    it("should find user by id", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed",
        name: "Test",
        image: null,
        createdAt: Date.now(),
      };

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            return { rows: [mockUser] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.findUserById("user-123");

      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.findUserById("user-123");

      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user fields", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed",
        name: "Test",
        image: null,
        createdAt: Date.now(),
      };

      let idSelectCalls = 0;
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            idSelectCalls += 1;
            if (idSelectCalls === 1) return { rows: [mockUser] };
            return { rows: [{ ...mockUser, name: "Updated" }] };
          }
          if (sql.includes("UPDATE users SET")) {
            return { rows: [], rowsAffected: 1 };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.updateUser("user-123", {
        name: "Updated",
      });

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("UPDATE users SET"),
        }),
      );
      expect(result?.name).toBe("Updated");
    });

    it("should return null when user not found", async () => {
      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            return { rows: [] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.updateUser("user-123", {
        name: "Updated",
      });

      expect(result).toBeNull();
    });

    it("should return user unchanged when no updates provided", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed",
        name: "Test",
        image: null,
        createdAt: Date.now(),
      };

      mockClient.execute.mockImplementation(
        async (stmt: { sql: string } | string) => {
          const sql = typeof stmt === "string" ? stmt : stmt.sql;
          if (sql === "PRAGMA foreign_keys = ON") return { rows: [] };
          if (sql.includes("PRAGMA table_info(user_resumes)")) {
            return { rows: [{ name: "deletedAt" }] };
          }
          if (sql.includes("PRAGMA table_info(user_usage)")) {
            return {
              rows: [
                { name: "aiSuggestionUsage" },
                { name: "aiSuggestionLastReset" },
              ],
            };
          }
          if (sql.includes("SELECT * FROM users WHERE id = ?")) {
            return { rows: [mockUser] };
          }
          return { rows: [] };
        },
      );

      const result = await dbOperations.updateUser("user-123", {});

      expect(result).toEqual(mockUser);
    });
  });
});
