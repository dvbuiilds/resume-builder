import { NextRequest } from 'next/server';
import { vi } from 'vitest';
import type { User } from '@resume-builder/lib/db';

export const createMockRequest = (
  body?: any,
  headers?: Record<string, string>,
): NextRequest => {
  const url = 'http://localhost:3000/api/test';
  const init: any = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(url, init as any);
};

export const createMockToken = (
  overrides?: Partial<{ id: string; email: string }>,
) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  ...overrides,
});

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  password: 'hashed-password',
  name: 'Test User',
  image: null,
  createdAt: Date.now(),
  ...overrides,
});

export const mockGetToken = vi.fn();
export const mockDbOperations = {
  findUserById: vi.fn(),
  getAISuggestionUsage: vi.fn(),
  incrementAISuggestionUsage: vi.fn(),
  maxAISuggestionUsage: 10,
  getTransformUsage: vi.fn(),
  incrementTransformUsage: vi.fn(),
  maxTransformUsage: 4,
  getUserResumes: vi.fn(),
  upsertUserResume: vi.fn(),
  deleteUserResume: vi.fn(),
  restoreUserResume: vi.fn(),
};

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: (...args: any[]) => mockGetToken(...args),
}));

// Mock db operations
vi.mock('@resume-builder/lib/db', async () => {
  const actual = await vi.importActual('@resume-builder/lib/db');
  return {
    ...actual,
    dbOperations: mockDbOperations,
  };
});
