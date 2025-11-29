import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../../../../app/api/ai-suggestions/route';
import {
  mockGetToken,
  mockDbOperations,
  createMockRequest,
  createMockUser,
} from '../../test-utils/api-mocks';
import { GroqTimeoutError } from '@resume-builder/llms/groq/groq';

// Mock Groq functions
const mockGetDescriptionSuggestionsWithGroq = vi.fn();
const mockWithTimeout = vi.fn();
const mockValidateAISuggestionResponse = vi.fn();

vi.mock('@resume-builder/llms/groq/groq', () => ({
  getDescriptionSuggestionsWithGroq: (...args: any[]) =>
    mockGetDescriptionSuggestionsWithGroq(...args),
  GroqTimeoutError,
}));

vi.mock('@resume-builder/utils/withTimeout', () => ({
  withTimeout: (...args: any[]) => mockWithTimeout(...args),
}));

vi.mock(
  '@resume-builder/components/resume-builder/types/ai-suggestion-schema',
  () => ({
    validateAISuggestionResponse: (...args: any[]) =>
      mockValidateAISuggestionResponse(...args),
  }),
);

describe('ai-suggestions API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should return suggestions for valid request', async () => {
      const mockUser = createMockUser();
      const mockSuggestions = ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'];

      mockGetToken.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(5);
      mockGetDescriptionSuggestionsWithGroq.mockResolvedValue(mockSuggestions);
      mockWithTimeout.mockResolvedValue(mockSuggestions);
      mockValidateAISuggestionResponse.mockReturnValue(mockSuggestions);
      mockDbOperations.incrementAISuggestionUsage.mockImplementation(() => {});
      mockDbOperations.getAISuggestionUsage
        .mockReturnValueOnce(5)
        .mockReturnValueOnce(6);

      const req = createMockRequest({
        description: 'Worked on software development',
        jobRole: 'Software Engineer',
        companyName: 'Tech Corp',
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.suggestions).toEqual(mockSuggestions);
      expect(json.usageCount).toBe(6);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest({ description: 'Test' });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toContain('signed in');
    });

    it('should return 401 when user not found in database', async () => {
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(null);

      const req = createMockRequest({ description: 'Test' });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toContain('session has expired');
    });

    it('should return 429 when usage limit exceeded', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(10);

      const req = createMockRequest({ description: 'Test' });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(429);
      expect(json.error).toContain('maximum number');
    });

    it('should return 400 for missing description', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(5);

      const req = createMockRequest({});
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Missing or invalid description');
    });

    it('should return 400 for empty description', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(5);

      const req = createMockRequest({ description: '   ' });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('cannot be empty');
    });

    it('should return 504 for Groq timeout', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(5);
      mockWithTimeout.mockRejectedValue(new GroqTimeoutError(60000));

      const req = createMockRequest({ description: 'Test' });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(504);
      expect(json.error).toContain('timed out');
    });

    it('should return 502 for invalid AI response', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(5);
      mockWithTimeout.mockResolvedValue(['invalid', 'response']);
      mockValidateAISuggestionResponse.mockReturnValue(null);

      const req = createMockRequest({ description: 'Test' });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(502);
      expect(json.error).toContain('valid suggestions');
    });

    it('should handle errors gracefully', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(5);
      mockWithTimeout.mockRejectedValue(new Error('Unexpected error'));

      const req = createMockRequest({ description: 'Test' });
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Unexpected error');
    });
  });

  describe('GET', () => {
    it('should return usage count for authenticated user', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getAISuggestionUsage.mockReturnValue(7);

      const req = createMockRequest();
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.usageCount).toBe(7);
      expect(json.maxUsage).toBe(10);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest();
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toContain('signed in');
    });

    it('should return 401 when user not found', async () => {
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(null);

      const req = createMockRequest();
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(401);
    });
  });
});
