import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  getNewChatCompletionWithGroq,
  GroqTimeoutError,
} from '@resume-builder/llms/groq/groq';
import { parseResumeOutput } from '@resume-builder/lib/llm/transform-pdf-utils';
import { withTimeout } from '@resume-builder/utils/withTimeout';
import { dbOperations } from '@resume-builder/lib/db';

const GROQ_TIMEOUT_MS = 120_000;

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const userId = token?.id as string | undefined;

  console.log('[POST /api/transform-pdf-string] Token received:', {
    hasToken: !!token,
    userId: userId,
    tokenId: token?.id,
    tokenEmail: token?.email,
  });

  if (!userId) {
    console.error('[POST /api/transform-pdf-string] No userId found in token');
    return NextResponse.json(
      { error: 'You must be signed in to transform a resume.' },
      { status: 401 },
    );
  }

  // Check if user exists in database
  const user = dbOperations.findUserById(userId);
  console.log('[POST /api/transform-pdf-string] User lookup:', {
    userId,
    userExists: !!user,
    userEmail: user?.email,
  });

  const currentUsage = dbOperations.getTransformUsage(userId);
  console.log('[POST /api/transform-pdf-string] Transform usage:', {
    userId,
    currentUsage,
    maxUsage: dbOperations.maxTransformUsage,
  });

  if (currentUsage >= dbOperations.maxTransformUsage) {
    return NextResponse.json(
      {
        error:
          'You have reached the maximum number of resume transformations allowed. Please contact support if you need additional transforms.',
      },
      { status: 429 },
    );
  }

  try {
    const payload = await req.json();
    const input =
      typeof payload === 'string'
        ? payload
        : typeof payload?.input === 'string'
          ? payload.input
          : undefined;

    if (!input) {
      return NextResponse.json(
        { error: 'Missing or invalid input string.' },
        { status: 400 },
      );
    }

    console.log('[POST /api/transform-pdf-string] Starting transformation:', {
      userId,
      inputLength: input.length,
    });

    const result = await withTimeout(
      getNewChatCompletionWithGroq(input),
      GROQ_TIMEOUT_MS,
    );

    if (typeof result !== 'string') {
      return NextResponse.json(
        { error: 'Groq did not return a string response.' },
        { status: 502 },
      );
    }

    const data = parseResumeOutput(result);

    if (!data) {
      return NextResponse.json(
        { error: 'Unable to extract resume data from LLM response.' },
        { status: 422 },
      );
    }

    console.log(
      '[POST /api/transform-pdf-string] Transformation successful, incrementing usage:',
      {
        userId,
      },
    );

    dbOperations.incrementTransformUsage(userId);

    console.log(
      '[POST /api/transform-pdf-string] Usage incremented successfully:',
      {
        userId,
        newUsage: dbOperations.getTransformUsage(userId),
      },
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    console.error(
      '[POST /api/transform-pdf-string] Error during transformation:',
      {
        userId,
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        isGroqTimeout: err instanceof GroqTimeoutError,
      },
    );

    if (err instanceof GroqTimeoutError) {
      return NextResponse.json({ error: err.message }, { status: 504 });
    }

    const message =
      err instanceof Error ? err.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
