import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbOperations } from '@resume-builder/lib/db';

// Mock better-sqlite3
const mockDb = {
  prepare: vi.fn(),
  exec: vi.fn(),
  pragma: vi.fn(),
};

const mockStmt = {
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
};

vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn(() => mockDb),
  };
});

describe('dbOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.prepare.mockReturnValue(mockStmt);
    mockStmt.run.mockReturnValue({ lastInsertRowid: 1 });
    mockStmt.get.mockReturnValue(undefined);
    mockStmt.all.mockReturnValue([]);
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
        image: 'https://example.com/image.jpg',
      };

      const result = dbOperations.createUser(userData);

      expect(mockStmt.run).toHaveBeenCalledWith(
        userData.id,
        userData.email,
        userData.password,
        userData.name,
        userData.image,
        expect.any(Number),
      );
      expect(result.id).toBe(userData.id);
      expect(result.email).toBe(userData.email);
      expect(result.createdAt).toBeGreaterThan(0);
    });

    it('should handle null optional fields', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        password: null,
      };

      const result = dbOperations.createUser(userData);

      expect(mockStmt.run).toHaveBeenCalledWith(
        userData.id,
        userData.email,
        null,
        null,
        null,
        expect.any(Number),
      );
      expect(result.name).toBeNull();
      expect(result.image).toBeNull();
    });
  });

  describe('getUserResumes', () => {
    it('should return user resumes', () => {
      const mockResumes = [
        {
          id: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Test"}',
          updatedAt: Date.now(),
        },
      ];

      mockStmt.all.mockReturnValue(mockResumes);

      const result = dbOperations.getUserResumes('user-123');

      expect(result).toEqual(mockResumes);
      expect(mockStmt.all).toHaveBeenCalledWith('user-123', 4);
    });

    it('should return empty array when no resumes', () => {
      mockStmt.all.mockReturnValue([]);

      const result = dbOperations.getUserResumes('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('upsertUserResume', () => {
    it('should update existing resume', () => {
      const existingStmt = {
        get: vi.fn().mockReturnValue({ id: 'row-1' }),
      };
      const updateStmt = {
        run: vi.fn(),
      };

      mockDb.prepare
        .mockReturnValueOnce(existingStmt) // existing check
        .mockReturnValueOnce(updateStmt) // update statement
        .mockReturnValueOnce({ all: vi.fn().mockReturnValue([]) }); // cleanup check

      const userCheckStmt = {
        get: vi
          .fn()
          .mockReturnValue({ id: 'user-123', email: 'test@example.com' }),
      };
      mockDb.prepare.mockReturnValueOnce(userCheckStmt);

      dbOperations.upsertUserResume('user-123', {
        resumeId: 'resume-1',
        data: '{"title":"Updated"}',
        resumeRowId: 'row-1',
      });

      expect(updateStmt.run).toHaveBeenCalled();
    });

    it('should insert new resume', () => {
      const existingStmt = {
        get: vi.fn().mockReturnValue(undefined),
      };
      const insertStmt = {
        run: vi.fn(),
      };

      mockDb.prepare
        .mockReturnValueOnce(existingStmt) // existing check
        .mockReturnValueOnce(insertStmt) // insert statement
        .mockReturnValueOnce({ all: vi.fn().mockReturnValue([]) }); // cleanup check

      const userCheckStmt = {
        get: vi
          .fn()
          .mockReturnValue({ id: 'user-123', email: 'test@example.com' }),
      };
      mockDb.prepare.mockReturnValueOnce(userCheckStmt);

      dbOperations.upsertUserResume('user-123', {
        resumeId: 'resume-1',
        data: '{"title":"New"}',
      });

      expect(insertStmt.run).toHaveBeenCalled();
    });
  });

  describe('getTransformUsage', () => {
    it('should return usage count', () => {
      mockStmt.get.mockReturnValue({ transformUsage: 3 });

      const result = dbOperations.getTransformUsage('user-123');

      expect(result).toBe(3);
    });

    it('should return 0 when no usage record exists', () => {
      mockStmt.get.mockReturnValue(undefined);

      const result = dbOperations.getTransformUsage('user-123');

      expect(result).toBe(0);
    });
  });

  describe('incrementTransformUsage', () => {
    it('should increment usage count', () => {
      const upsertStmt = {
        run: vi.fn(),
      };

      mockDb.prepare.mockReturnValueOnce({
        get: vi.fn().mockReturnValue({ id: 'user-123' }),
      }); // user check
      mockDb.prepare.mockReturnValueOnce(upsertStmt); // upsert statement

      dbOperations.incrementTransformUsage('user-123');

      expect(upsertStmt.run).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getAISuggestionUsage', () => {
    it('should return usage count when within 24 hours', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      mockStmt.get.mockReturnValue({
        aiSuggestionUsage: 5,
        aiSuggestionLastReset: oneHourAgo,
      });

      const result = dbOperations.getAISuggestionUsage('user-123');

      expect(result).toBe(5);
    });

    it('should reset usage when 24 hours have passed', () => {
      const now = Date.now();
      const twentyFiveHoursAgo = now - 25 * 60 * 60 * 1000;

      const resetStmt = {
        run: vi.fn(),
      };

      mockStmt.get.mockReturnValue({
        aiSuggestionUsage: 10,
        aiSuggestionLastReset: twentyFiveHoursAgo,
      });

      mockDb.prepare
        .mockReturnValueOnce(mockStmt)
        .mockReturnValueOnce(resetStmt);

      const result = dbOperations.getAISuggestionUsage('user-123');

      expect(result).toBe(0);
      expect(resetStmt.run).toHaveBeenCalled();
    });

    it('should return 0 when no usage record exists', () => {
      mockStmt.get.mockReturnValue(undefined);

      const result = dbOperations.getAISuggestionUsage('user-123');

      expect(result).toBe(0);
    });
  });

  describe('incrementAISuggestionUsage', () => {
    it('should increment usage and set reset time', () => {
      const upsertStmt = {
        run: vi.fn(),
      };

      mockDb.prepare.mockReturnValue(upsertStmt);

      dbOperations.incrementAISuggestionUsage('user-123');

      expect(upsertStmt.run).toHaveBeenCalledWith(
        'user-123',
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  describe('deleteUserResume', () => {
    it('should delete resume', () => {
      const verifyStmt = {
        get: vi.fn().mockReturnValue({ id: 'row-1' }),
      };
      const deleteStmt = {
        run: vi.fn(),
      };

      mockDb.prepare
        .mockReturnValueOnce(verifyStmt)
        .mockReturnValueOnce(deleteStmt);

      dbOperations.deleteUserResume('user-123', 'resume-1');

      expect(deleteStmt.run).toHaveBeenCalled();
    });

    it('should throw error when resume not found', () => {
      const verifyStmt = {
        get: vi.fn().mockReturnValue(undefined),
      };

      mockDb.prepare.mockReturnValue(verifyStmt);

      expect(() => {
        dbOperations.deleteUserResume('user-123', 'resume-1');
      }).toThrow('Resume not found');
    });
  });

  describe('restoreUserResume', () => {
    it('should restore deleted resume', () => {
      const verifyStmt = {
        get: vi.fn().mockReturnValue({ id: 'row-1' }),
      };
      const restoreStmt = {
        run: vi.fn(),
      };

      mockDb.prepare
        .mockReturnValueOnce(verifyStmt)
        .mockReturnValueOnce(restoreStmt);

      dbOperations.restoreUserResume('user-123', 'resume-1');

      expect(restoreStmt.run).toHaveBeenCalled();
    });

    it('should throw error when resume not found', () => {
      const verifyStmt = {
        get: vi.fn().mockReturnValue(undefined),
      };

      mockDb.prepare.mockReturnValue(verifyStmt);

      expect(() => {
        dbOperations.restoreUserResume('user-123', 'resume-1');
      }).toThrow('Resume not found');
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        image: null,
        createdAt: Date.now(),
      };

      mockStmt.get.mockReturnValue(mockUser);

      const result = dbOperations.findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', () => {
      mockStmt.get.mockReturnValue(undefined);

      const result = dbOperations.findUserByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find user by id', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        image: null,
        createdAt: Date.now(),
      };

      mockStmt.get.mockReturnValue(mockUser);

      const result = dbOperations.findUserById('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', () => {
      mockStmt.get.mockReturnValue(undefined);

      const result = dbOperations.findUserById('user-123');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        image: null,
        createdAt: Date.now(),
      };

      const updateStmt = {
        run: vi.fn(),
      };

      mockDb.prepare
        .mockReturnValueOnce({ get: vi.fn().mockReturnValue(mockUser) }) // find user
        .mockReturnValueOnce(updateStmt) // update statement
        .mockReturnValueOnce({
          get: vi.fn().mockReturnValue({ ...mockUser, name: 'Updated' }),
        }); // get updated

      const result = dbOperations.updateUser('user-123', {
        name: 'Updated',
      });

      expect(updateStmt.run).toHaveBeenCalled();
      expect(result?.name).toBe('Updated');
    });

    it('should return null when user not found', () => {
      mockDb.prepare.mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      });

      const result = dbOperations.updateUser('user-123', {
        name: 'Updated',
      });

      expect(result).toBeNull();
    });

    it('should return user unchanged when no updates provided', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        image: null,
        createdAt: Date.now(),
      };

      mockDb.prepare.mockReturnValue({
        get: vi.fn().mockReturnValue(mockUser),
      });

      const result = dbOperations.updateUser('user-123', {});

      expect(result).toEqual(mockUser);
    });
  });
});
