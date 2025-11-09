import { NextRequest, NextResponse } from 'next/server';
import {
  getNewChatCompletionWithGroq,
  GroqTimeoutError,
} from '@/llms/groq/groq';
import { parseResumeOutput } from '@/lib/llm/transform-pdf-utils';
import { withTimeout } from '@/utils/withTimeout';

const GROQ_TIMEOUT_MS = 120_000;

export async function POST(req: NextRequest) {
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
