import { describe, it, expect } from 'vitest';
import {
  createErrorResponse,
  createSuccessResponse,
} from '@resume-builder/lib/api-utils';

describe('api-utils', () => {
  describe('createErrorResponse', () => {
    it('should create error response with default status 500', async () => {
      const response = createErrorResponse('Test error');

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Test error');
    });

    it('should create error response with custom status code', async () => {
      const response = createErrorResponse('Not found', 404);

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBe('Not found');
    });

    it('should handle various status codes', async () => {
      const statusCodes = [400, 401, 403, 404, 429, 500, 502, 504];

      for (const status of statusCodes) {
        const response = createErrorResponse('Error', status);
        expect(response.status).toBe(status);
        const json = await response.json();
        expect(json.error).toBe('Error');
      }
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with default status 200', async () => {
      const data = { message: 'Success' };
      const response = createSuccessResponse(data);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toEqual(data);
    });

    it('should create success response with custom status code', async () => {
      const data = { id: '123' };
      const response = createSuccessResponse(data, 201);

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.data).toEqual(data);
    });

    it('should serialize complex data structures', async () => {
      const data = {
        items: [{ id: 1, name: 'Test' }],
        metadata: { count: 1 },
      };
      const response = createSuccessResponse(data);

      const json = await response.json();
      expect(json.data).toEqual(data);
    });

    it('should handle null and undefined data', async () => {
      const response1 = createSuccessResponse(null);
      const json1 = await response1.json();
      expect(json1.data).toBeNull();

      const response2 = createSuccessResponse(undefined);
      const json2 = await response2.json();
      expect(json2.data).toBeUndefined();
    });
  });
});
