import { NextRequest, NextResponse } from 'next/server';
import {
  getNewChatCompletionWithGroq,
  GroqTimeoutError,
} from '@resume-builder/llms/groq/groq';
import { parseResumeOutput } from '@resume-builder/lib/llm/transform-pdf-utils';
import { withTimeout } from '@resume-builder/utils/withTimeout';
import { dbOperations } from '@resume-builder/lib/db';
import { requireAuth } from '@resume-builder/lib/api-auth';
import { createErrorResponse } from '@resume-builder/lib/api-utils';

const GROQ_TIMEOUT_MS = 120_000;

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(
      req,
      'You must be signed in to transform a resume.',
    );
    const { userId } = session;

    const currentUsage = dbOperations.getTransformUsage(userId);

    if (currentUsage >= dbOperations.maxTransformUsage) {
      return createErrorResponse(
        'You have reached the maximum number of resume transformations allowed. Please contact support if you need additional transforms.',
        429,
      );
    }
    const payload = await req.json();
    const input =
      typeof payload === 'string'
        ? payload
        : typeof payload?.input === 'string'
          ? payload.input
          : undefined;

    if (!input) {
      return createErrorResponse('Missing or invalid input string.', 400);
    }

    const result = await withTimeout(
      getNewChatCompletionWithGroq(input),
      GROQ_TIMEOUT_MS,
    );

    if (typeof result !== 'string') {
      return createErrorResponse('Groq did not return a string response.', 502);
    }

    const data = parseResumeOutput(result);

    if (!data) {
      return createErrorResponse(
        'Unable to extract resume data from LLM response.',
        422,
      );
    }

    dbOperations.incrementTransformUsage(userId);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof NextResponse) {
      // Auth error from requireAuth
      return err;
    }

    if (err instanceof GroqTimeoutError) {
      return createErrorResponse(err.message, 504);
    }

    const message =
      err instanceof Error ? err.message : 'Internal server error';

    return createErrorResponse(message, 500);
  }
}
