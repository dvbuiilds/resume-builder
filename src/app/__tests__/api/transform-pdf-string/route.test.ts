import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../../../app/api/transform-pdf-string/route';
import {
  mockGetToken,
  mockDbOperations,
  createMockRequest,
  createMockUser,
} from '../../test-utils/api-mocks';
import { GroqTimeoutError } from '@resume-builder/llms/groq/groq';

const mockGetNewChatCompletionWithGroq = vi.fn();
const mockWithTimeout = vi.fn();
const mockParseResumeOutput = vi.fn();

vi.mock('@resume-builder/llms/groq/groq', () => ({
  getNewChatCompletionWithGroq: (...args: any[]) =>
    mockGetNewChatCompletionWithGroq(...args),
  GroqTimeoutError,
}));

vi.mock('@resume-builder/utils/withTimeout', () => ({
  withTimeout: (...args: any[]) => mockWithTimeout(...args),
}));

vi.mock('@resume-builder/lib/llm/transform-pdf-utils', () => ({
  parseResumeOutput: (...args: any[]) => mockParseResumeOutput(...args),
}));

describe('transform-pdf-string API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should transform valid PDF string', async () => {
      const mockUser = createMockUser();
      const mockLLMResponse = '{"title":"John Doe","socialHandles":[]}';
      const mockParsedData = {
        title: 'John Doe',
        socialHandles: [],
        workExperience: { title: 'WORK EXPERIENCE', experience: [] },
        projects: { title: 'PROJECTS', projects: [] },
        education: { title: 'EDUCATION', courses: [] },
        activities: { title: 'ACTIVITIES', activities: [] },
        skills: { title: 'SKILLS', skillSet: [] },
        achievements: { title: 'ACHIEVEMENTS', achievementList: [] },
      };

      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(2);
      mockGetNewChatCompletionWithGroq.mockResolvedValue(mockLLMResponse);
      mockWithTimeout.mockResolvedValue(mockLLMResponse);
      mockParseResumeOutput.mockReturnValue(mockParsedData);
      mockDbOperations.incrementTransformUsage.mockImplementation(() => {});

      const req = createMockRequest('PDF text content here');

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(mockParsedData);
      expect(mockDbOperations.incrementTransformUsage).toHaveBeenCalledWith(
        'test-user-id',
      );
    });

    it('should handle string payload directly', async () => {
      const mockUser = createMockUser();
      const mockLLMResponse = '{"title":"Test"}';
      const mockParsedData = {
        title: 'Test',
        socialHandles: [],
        workExperience: { title: 'WORK EXPERIENCE', experience: [] },
        projects: { title: 'PROJECTS', projects: [] },
        education: { title: 'EDUCATION', courses: [] },
        activities: { title: 'ACTIVITIES', activities: [] },
        skills: { title: 'SKILLS', skillSet: [] },
        achievements: { title: 'ACHIEVEMENTS', achievementList: [] },
      };

      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);
      mockWithTimeout.mockResolvedValue(mockLLMResponse);
      mockParseResumeOutput.mockReturnValue(mockParsedData);

      const req = createMockRequest('PDF string');

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(mockParsedData);
    });

    it('should handle object payload with input field', async () => {
      const mockUser = createMockUser();
      const mockLLMResponse = '{"title":"Test"}';
      const mockParsedData = {
        title: 'Test',
        socialHandles: [],
        workExperience: { title: 'WORK EXPERIENCE', experience: [] },
        projects: { title: 'PROJECTS', projects: [] },
        education: { title: 'EDUCATION', courses: [] },
        activities: { title: 'ACTIVITIES', activities: [] },
        skills: { title: 'SKILLS', skillSet: [] },
        achievements: { title: 'ACHIEVEMENTS', achievementList: [] },
      };

      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);
      mockWithTimeout.mockResolvedValue(mockLLMResponse);
      mockParseResumeOutput.mockReturnValue(mockParsedData);

      const req = createMockRequest({ input: 'PDF string' });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(mockParsedData);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockGetToken.mockResolvedValue(null);

      const req = createMockRequest('PDF text');
      const response = await POST(req);

      expect(response.status).toBe(401);
    });

    it('should return 429 when usage limit exceeded', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(4);

      const req = createMockRequest('PDF text');
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(429);
      expect(json.error).toContain('maximum number');
    });

    it('should return 400 for missing input', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);

      const req = createMockRequest({});
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Missing or invalid input');
    });

    it('should return 400 for empty input', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);

      const req = createMockRequest('');
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Missing or invalid input');
    });

    it('should return 504 for Groq timeout', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);
      mockWithTimeout.mockRejectedValue(new GroqTimeoutError(120000));

      const req = createMockRequest('PDF text');
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(504);
      expect(json.error).toContain('timed out');
    });

    it('should return 502 when Groq returns non-string', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);
      mockWithTimeout.mockResolvedValue({ invalid: 'response' });

      const req = createMockRequest('PDF text');
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(502);
      expect(json.error).toContain('string response');
    });

    it('should return 422 when unable to parse resume data', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);
      mockWithTimeout.mockResolvedValue('invalid json');
      mockParseResumeOutput.mockReturnValue(null);

      const req = createMockRequest('PDF text');
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(422);
      expect(json.error).toContain('Unable to extract resume data');
    });

    it('should handle unexpected errors', async () => {
      const mockUser = createMockUser();
      mockGetToken.mockResolvedValue({ id: 'test-user-id' });
      mockDbOperations.findUserById.mockReturnValue(mockUser);
      mockDbOperations.getTransformUsage.mockReturnValue(1);
      mockWithTimeout.mockRejectedValue(new Error('Unexpected error'));

      const req = createMockRequest('PDF text');
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Unexpected error');
    });
  });
});
