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

  if (!userId) {
    return NextResponse.json(
      { error: 'You must be signed in to transform a resume.' },
      { status: 401 },
    );
  }

  const currentUsage = dbOperations.getTransformUsage(userId);
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

    dbOperations.incrementTransformUsage(userId);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof GroqTimeoutError) {
      return NextResponse.json({ error: err.message }, { status: 504 });
    }

    const message =
      err instanceof Error ? err.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
