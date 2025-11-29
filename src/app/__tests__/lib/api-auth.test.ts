import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockGetToken,
  mockDbOperations,
  createMockRequest,
  createMockUser,
} from '../test-utils/api-mocks';
import { validateUserSession, requireAuth } from '@resume-builder/lib/api-auth';

describe('api-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks
    mockGetToken.mockClear();
    mockDbOperations.findUserById.mockClear();
  });

  describe('validateUserSession', () => {
    it('should return session data for valid user', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);

      const req = createMockRequest();
      const result = await validateUserSession(req);

      expect(result).not.toBeNull();
      expect(result?.userId).toBe('test-user-id');
      expect(result?.user).toEqual(mockUser);
      expect(result?.token.id).toBe('test-user-id');
      expect(result?.token.email).toBe('test@example.com');
    });

    it('should return null when no token', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest();
      const result = await validateUserSession(req);

      expect(result).toBeNull();
    });

    it('should return null when token has no id', async () => {
      mockGetToken.mockResolvedValue({ email: 'test@example.com' });

      const req = createMockRequest();
      const result = await validateUserSession(req);

      expect(result).toBeNull();
    });

    it('should return null when user not found in database', async () => {
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(null);

      const req = createMockRequest();
      const result = await validateUserSession(req);

      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return session for valid user', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);

      const req = createMockRequest();
      const result = await requireAuth(req);

      expect(result.userId).toBe('test-user-id');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw NextResponse with 401 when no session', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest();

      await expect(requireAuth(req)).rejects.toBeInstanceOf(Response);

      try {
        await requireAuth(req);
      } catch (error: any) {
        expect(error.status).toBe(401);
        const json = await error.json();
        expect(json.error).toContain('session has expired');
      }
    });

    it('should use custom error message when provided', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest();
      const customMessage = 'Custom auth error';

      try {
        await requireAuth(req, customMessage);
      } catch (error: any) {
        expect(error.status).toBe(401);
        const json = await error.json();
        expect(json.error).toBe(customMessage);
      }
    });
  });
});
