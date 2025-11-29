import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockGetToken,
  mockDbOperations,
  createMockRequest,
  createMockUser,
} from '../../test-utils/api-mocks';

const mockParseErrorMessage = vi.fn();

vi.mock(
  '@resume-builder/components/resume-builder/utils/parseErrorMessage',
  () => ({
    parseErrorMessage: (...args: any[]) => mockParseErrorMessage(...args),
  }),
);

// Import route handlers after mocks are set up
const { GET, POST, DELETE, PATCH } = await import(
  '../../../../app/api/past-resumes/route'
);

describe('past-resumes API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks and set default return values
    mockGetToken.mockClear();
    mockDbOperations.findUserById.mockClear();
    mockDbOperations.getUserResumes.mockClear();
    mockDbOperations.upsertUserResume.mockClear();
    mockDbOperations.deleteUserResume.mockClear();
    mockDbOperations.restoreUserResume.mockClear();
    mockParseErrorMessage.mockClear();
  });

  describe('GET', () => {
    it('should return user resumes', async () => {
      const mockUser = createMockUser();
      const mockResumes = [
        {
          id: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Test Resume"}',
          updatedAt: Date.now(),
        },
        {
          id: 'row-2',
          resumeId: 'resume-2',
          data: '{"title":"Another Resume"}',
          updatedAt: Date.now() - 1000,
        },
      ];

      // Set up mocks BEFORE calling the route handler
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getUserResumes.mockReturnValue(mockResumes);

      const req = createMockRequest();
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toHaveLength(2);
      expect(json.data[0]).toHaveProperty('rowId', 'row-1');
      expect(json.data[0]).toHaveProperty('resumeId', 'resume-1');
    });

    it('should return empty array when no resumes', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getUserResumes.mockReturnValue([]);

      const req = createMockRequest();
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual([]);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest();
      const response = await GET(req);

      expect(response.status).toBe(401);
    });

    it('should handle database errors', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getUserResumes.mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = createMockRequest();
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Failed to load resumes');
    });
  });

  describe('POST', () => {
    it('should save new resume', async () => {
      const mockUser = createMockUser();
      const mockResumes = [
        {
          id: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"New Resume"}',
          updatedAt: Date.now(),
        },
      ];

      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.upsertUserResume.mockImplementation(() => {});
      mockDbOperations.getUserResumes.mockReturnValue(mockResumes);

      const req = createMockRequest({
        resumeId: 'resume-1',
        data: '{"title":"New Resume"}',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(mockDbOperations.upsertUserResume).toHaveBeenCalledWith(
        'test-user-id',
        {
          resumeRowId: undefined,
          resumeId: 'resume-1',
          data: '{"title":"New Resume"}',
        },
      );
      expect(json.data).toHaveLength(1);
    });

    it('should update existing resume', async () => {
      const mockUser = createMockUser();
      const mockResumes = [
        {
          id: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Updated Resume"}',
          updatedAt: Date.now(),
        },
      ];

      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.upsertUserResume.mockImplementation(() => {});
      mockDbOperations.getUserResumes.mockReturnValue(mockResumes);

      const req = createMockRequest({
        resumeId: 'resume-1',
        data: '{"title":"Updated Resume"}',
        rowId: 'row-1',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(mockDbOperations.upsertUserResume).toHaveBeenCalledWith(
        'test-user-id',
        {
          resumeRowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Updated Resume"}',
        },
      );
    });

    it('should return 400 for invalid payload - missing resumeId', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);

      const req = createMockRequest({
        data: '{"title":"Test"}',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid payload');
    });

    it('should return 400 for invalid payload - missing data', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid payload');
    });

    it('should return 400 for empty strings', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);

      const req = createMockRequest({
        resumeId: '   ',
        data: '   ',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid payload');
    });

    it('should return 401 for unauthenticated request', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest({
        resumeId: 'resume-1',
        data: '{"title":"Test"}',
      });

      const response = await POST(req);

      expect(response.status).toBe(401);
    });

    it('should handle database errors', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.upsertUserResume.mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = createMockRequest({
        resumeId: 'resume-1',
        data: '{"title":"Test"}',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Failed to save resume');
    });

    it('should handle Response errors from db operations', async () => {
      const mockUser = createMockUser();
      const errorResponse = new Response('Error', { status: 500 });
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.upsertUserResume.mockImplementation(() => {
        throw errorResponse;
      });
      mockParseErrorMessage.mockResolvedValue('Database error message');

      const req = createMockRequest({
        resumeId: 'resume-1',
        data: '{"title":"Test"}',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Database error message');
    });
  });

  describe('DELETE', () => {
    it('should delete resume', async () => {
      const mockUser = createMockUser();
      const mockResumes: any[] = [];

      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.deleteUserResume.mockImplementation(() => {});
      mockDbOperations.getUserResumes.mockReturnValue(mockResumes);

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await DELETE(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(mockDbOperations.deleteUserResume).toHaveBeenCalledWith(
        'test-user-id',
        'resume-1',
      );
      expect(json.data).toEqual([]);
    });

    it('should return 400 for invalid payload', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);

      const req = createMockRequest({});

      const response = await DELETE(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid payload');
    });

    it('should return 404 when resume not found', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.deleteUserResume.mockImplementation(() => {
        throw new Error('Resume not found');
      });

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await DELETE(req);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Resume not found');
    });

    it('should return 401 for unauthenticated request', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await DELETE(req);

      expect(response.status).toBe(401);
    });

    it('should handle other errors', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.deleteUserResume.mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await DELETE(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Failed to delete resume');
    });
  });

  describe('PATCH', () => {
    it('should restore deleted resume', async () => {
      const mockUser = createMockUser();
      const mockResumes = [
        {
          id: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Restored Resume"}',
          updatedAt: Date.now(),
        },
      ];

      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.restoreUserResume.mockImplementation(() => {});
      mockDbOperations.getUserResumes.mockReturnValue(mockResumes);

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await PATCH(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(mockDbOperations.restoreUserResume).toHaveBeenCalledWith(
        'test-user-id',
        'resume-1',
      );
      expect(json.data).toHaveLength(1);
    });

    it('should return 400 for invalid payload', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);

      const req = createMockRequest({});

      const response = await PATCH(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid payload');
    });

    it('should return 404 when resume not found', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.restoreUserResume.mockImplementation(() => {
        throw new Error('Resume not found');
      });

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await PATCH(req);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Resume not found');
    });

    it('should return 401 for unauthenticated request', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await PATCH(req);

      expect(response.status).toBe(401);
    });

    it('should handle other errors', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.restoreUserResume.mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = createMockRequest({
        resumeId: 'resume-1',
      });

      const response = await PATCH(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Failed to restore resume');
    });
  });
});
