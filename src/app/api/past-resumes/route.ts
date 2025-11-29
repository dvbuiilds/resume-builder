import { NextRequest, NextResponse } from 'next/server';

import { dbOperations } from '@resume-builder/lib/db';
import { parseErrorMessage } from '@resume-builder/components/resume-builder/utils/parseErrorMessage';
import { requireAuth } from '@resume-builder/lib/api-auth';
import { createErrorResponse } from '@resume-builder/lib/api-utils';

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
  try {
    const session = await requireAuth(request);
    const { userId } = session;

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    if (err instanceof NextResponse) {
      // Auth error from requireAuth
      return err;
    }

    return createErrorResponse('Failed to load resumes', 500);
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await requireAuth(request);
    const { userId } = session;
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
      return createErrorResponse('Invalid payload', 400);
    }

    dbOperations.upsertUserResume(userId, {
      resumeRowId: rowId,
      resumeId,
      data,
    });

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    if (err instanceof NextResponse) {
      // Auth error from requireAuth
      return err;
    }
    if (err instanceof Response) {
      const message = await parseErrorMessage(err);
      return createErrorResponse(message, err.status || 500);
    }
    return createErrorResponse('Failed to save resume', 500);
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const session = await requireAuth(request);
    const { userId } = session;

    const payload = await request.json();

    const resumeId =
      typeof payload?.resumeId === 'string' && payload.resumeId.trim()
        ? payload.resumeId.trim()
        : null;

    if (!resumeId) {
      return createErrorResponse('Invalid payload', 400);
    }

    dbOperations.deleteUserResume(userId, resumeId);

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    if (err instanceof NextResponse) {
      // Auth error from requireAuth
      return err;
    }
    if (err instanceof Error && err.message === 'Resume not found') {
      return createErrorResponse('Resume not found', 404);
    }
    return createErrorResponse('Failed to delete resume', 500);
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const session = await requireAuth(request);
    const { userId } = session;

    const payload = await request.json();

    const resumeId =
      typeof payload?.resumeId === 'string' && payload.resumeId.trim()
        ? payload.resumeId.trim()
        : null;

    if (!resumeId) {
      return createErrorResponse('Invalid payload', 400);
    }

    dbOperations.restoreUserResume(userId, resumeId);

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    if (err instanceof NextResponse) {
      // Auth error from requireAuth
      return err;
    }
    if (err instanceof Error && err.message === 'Resume not found') {
      return createErrorResponse('Resume not found', 404);
    }
    return createErrorResponse('Failed to restore resume', 500);
  }
};
