import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { dbOperations } from '@/lib/db';
import { parseErrorMessage } from '@/components/resume-builder/utils/parseErrorMessage';

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
  if (!userId) {
    return asErrorResponse('Unauthorized', 401);
  }

  try {
    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    console.error('Failed to load past resumes', err);
    return asErrorResponse('Failed to load resumes', 500);
  }
};

export const POST = async (request: NextRequest) => {
  const token = await getToken({ req: request });
  const userId = token?.id as string | undefined;

  if (!userId) {
    return asErrorResponse('Unauthorized', 401);
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

    dbOperations.upsertUserResume(userId, {
      resumeRowId: rowId,
      resumeId,
      data,
    });

    const rows = dbOperations.getUserResumes(userId);
    return NextResponse.json({ data: serializeResumes(rows) }, { status: 200 });
  } catch (err) {
    console.error('Failed to save past resume', err);
    if (err instanceof Response) {
      const message = await parseErrorMessage(err);
      return asErrorResponse(message, err.status || 500);
    }
    return asErrorResponse('Failed to save resume', 500);
  }
};
