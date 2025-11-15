import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { dbOperations } from '@resume-builder/lib/db';
import { parseErrorMessage } from '@resume-builder/components/resume-builder/utils/parseErrorMessage';

const asErrorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

const serializeResumes = (
  rows: Array<{
    id: string;
    resumeId: string;
    data: string;
    updatedAt: number;
  }>,
) =>
  rows.map((row) => ({
    rowId: row.id,
    resumeId: row.resumeId,
    data: row.data,
    updatedAt: row.updatedAt,
  }));

export const GET = async (request: NextRequest) => {
  const token = await getToken({ req: request });

  const userId = token?.id as string | undefined;
  console.log('[GET /api/past-resumes] Token received:', {
    hasToken: !!token,
    userId: userId,
    tokenId: token?.id,
  });

  if (!userId) {
    console.error('[GET /api/past-resumes] No userId found in token');
    return asErrorResponse('Unauthorized', 401);
  }

  // Check if user exists in database
  const user = dbOperations.findUserById(userId);
  console.log('[GET /api/past-resumes] User lookup:', {
    userId,
    userExists: !!user,
    userEmail: user?.email,
  });

  // If user doesn't exist in database, return 401 to invalidate session
  // This handles cases where the database was reset (e.g., on Vercel)
  if (!user) {
    console.error('[GET /api/past-resumes] User not found in database:', {
      userId,
      email: token?.email,
    });
    return asErrorResponse(
      'Your session has expired. Please sign in again.',
      401,
    );
  }

  try {
    const rows = dbOperations.getUserResumes(userId);
    console.log('[GET /api/past-resumes] Retrieved resumes:', {
      userId,
      resumeCount: rows.length,
    });
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/past-resumes] Failed to load past resumes:', {
      userId,
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return asErrorResponse('Failed to load resumes', 500);
  }
};

export const POST = async (request: NextRequest) => {
  const token = await getToken({ req: request });
  const userId = token?.id as string | undefined;

  console.log('[POST /api/past-resumes] Token received:', {
    hasToken: !!token,
    userId: userId,
    tokenId: token?.id,
    tokenEmail: token?.email,
  });

  if (!userId) {
    console.error('[POST /api/past-resumes] No userId found in token');
    return asErrorResponse('Unauthorized', 401);
  }

  // Check if user exists in database
  const user = dbOperations.findUserById(userId);
  console.log('[POST /api/past-resumes] User lookup:', {
    userId,
    userExists: !!user,
    userEmail: user?.email,
  });

  // If user doesn't exist in database, return 401 to invalidate session
  // This handles cases where the database was reset (e.g., on Vercel)
  if (!user) {
    console.error('[POST /api/past-resumes] User not found in database:', {
      userId,
      email: token?.email,
    });
    return asErrorResponse(
      'Your session has expired. Please sign in again.',
      401,
    );
  }

  try {
    const payload = await request.json();

    const resumeId =
      typeof payload?.resumeId === 'string' && payload.resumeId.trim()
        ? payload.resumeId.trim()
        : null;
    const data =
      typeof payload?.data === 'string' && payload.data.trim()
        ? payload.data
        : null;
    const rowId =
      typeof payload?.rowId === 'string' && payload.rowId.trim()
        ? payload.rowId.trim()
        : undefined;

    if (!resumeId || !data) {
      return asErrorResponse('Invalid payload', 400);
    }

    console.log('[POST /api/past-resumes] Attempting to upsert resume:', {
      userId,
      resumeId,
      hasRowId: !!rowId,
      dataLength: data.length,
    });

    dbOperations.upsertUserResume(userId, {
      resumeRowId: rowId,
      resumeId,
      data,
    });

    console.log('[POST /api/past-resumes] Resume upserted successfully:', {
      userId,
      resumeId,
    });

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/past-resumes] Failed to save past resume:', {
      userId,
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
    });
    if (err instanceof Response) {
      const message = await parseErrorMessage(err);
      return asErrorResponse(message, err.status || 500);
    }
    return asErrorResponse('Failed to save resume', 500);
  }
};

export const DELETE = async (request: NextRequest) => {
  const token = await getToken({ req: request });
  const userId = token?.id as string | undefined;

  if (!userId) {
    return asErrorResponse('Unauthorized', 401);
  }

  // Check if user exists in database
  const user = dbOperations.findUserById(userId);
  if (!user) {
    console.error('[DELETE /api/past-resumes] User not found in database:', {
      userId,
      email: token?.email,
    });
    return asErrorResponse(
      'Your session has expired. Please sign in again.',
      401,
    );
  }

  try {
    const payload = await request.json();

    const resumeId =
      typeof payload?.resumeId === 'string' && payload.resumeId.trim()
        ? payload.resumeId.trim()
        : null;

    if (!resumeId) {
      return asErrorResponse('Invalid payload', 400);
    }

    dbOperations.deleteUserResume(userId, resumeId);

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    console.error('Failed to delete resume', err);
    if (err instanceof Error && err.message === 'Resume not found') {
      return asErrorResponse('Resume not found', 404);
    }
    return asErrorResponse('Failed to delete resume', 500);
  }
};

export const PATCH = async (request: NextRequest) => {
  const token = await getToken({ req: request });
  const userId = token?.id as string | undefined;

  if (!userId) {
    return asErrorResponse('Unauthorized', 401);
  }

  // Check if user exists in database
  const user = dbOperations.findUserById(userId);
  if (!user) {
    console.error('[PATCH /api/past-resumes] User not found in database:', {
      userId,
      email: token?.email,
    });
    return asErrorResponse(
      'Your session has expired. Please sign in again.',
      401,
    );
  }

  try {
    const payload = await request.json();

    const resumeId =
      typeof payload?.resumeId === 'string' && payload.resumeId.trim()
        ? payload.resumeId.trim()
        : null;

    if (!resumeId) {
      return asErrorResponse('Invalid payload', 400);
    }

    dbOperations.restoreUserResume(userId, resumeId);

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    console.error('Failed to restore resume', err);
    if (err instanceof Error && err.message === 'Resume not found') {
      return asErrorResponse('Resume not found', 404);
    }
    return asErrorResponse('Failed to restore resume', 500);
  }
};
