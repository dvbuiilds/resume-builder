import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { dbOperations, type User } from './db';

export interface ValidatedSession {
  userId: string;
  user: User;
  token: {
    id: string;
    email?: string | null;
  };
}

/**
 * Validates user session from request token.
 * Returns session data if valid, null otherwise.
 */
export async function validateUserSession(
  req: NextRequest,
): Promise<ValidatedSession | null> {
  const token = await getToken({ req });
  const userId = token?.id as string | undefined;

  if (!userId) {
    return null;
  }

  const user = dbOperations.findUserById(userId);
  if (!user) {
    return null;
  }

  return {
    userId,
    user,
    token: {
      id: userId,
      email: token?.email,
    },
  };
}

/**
 * Requires authentication and returns validated session.
 * Throws NextResponse with 401 if not authenticated.
 */
export async function requireAuth(
  req: NextRequest,
  customErrorMessage?: string,
): Promise<ValidatedSession> {
  const session = await validateUserSession(req);

  if (!session) {
    throw NextResponse.json(
      {
        error:
          customErrorMessage ||
          'Your session has expired. Please sign in again.',
      },
      { status: 401 },
    );
  }

  return session;
}
