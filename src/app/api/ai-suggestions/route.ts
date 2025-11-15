import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  getDescriptionSuggestionsWithGroq,
  GroqTimeoutError,
} from '@resume-builder/llms/groq/groq';
import { validateAISuggestionResponse } from '@resume-builder/components/resume-builder/types/ai-suggestion-schema';
import { withTimeout } from '@resume-builder/utils/withTimeout';
import { dbOperations } from '@resume-builder/lib/db';

const GROQ_TIMEOUT_MS = 60_000;

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const userId = token?.id as string | undefined;

  if (!userId) {
    return NextResponse.json(
      { error: 'You must be signed in to use AI suggestions.' },
      { status: 401 },
    );
  }

  // Check usage limit (resets after 24h)
  const currentUsage = dbOperations.getAISuggestionUsage(userId);
  if (currentUsage >= dbOperations.maxAISuggestionUsage) {
    return NextResponse.json(
      {
        error:
          'You have reached the maximum number of AI suggestions allowed (10 per 24 hours). Please try again later.',
      },
      { status: 429 },
    );
  }

  try {
    const payload = await req.json();
    const { description, jobRole, companyName } = payload;

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid description string.' },
        { status: 400 },
      );
    }

    if (description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description cannot be empty.' },
        { status: 400 },
      );
    }

    const result = await withTimeout(
      getDescriptionSuggestionsWithGroq(
        description.trim(),
        jobRole?.trim(),
        companyName?.trim(),
      ),
      GROQ_TIMEOUT_MS,
    );

    // Validate response with Zod schema
    const validatedSuggestions = validateAISuggestionResponse(result);

    if (!validatedSuggestions) {
      return NextResponse.json(
        { error: 'AI did not return valid suggestions.' },
        { status: 502 },
      );
    }

    // Increment usage counter
    dbOperations.incrementAISuggestionUsage(userId);

    // Get updated usage count
    const updatedUsage = dbOperations.getAISuggestionUsage(userId);

    return NextResponse.json(
      {
        suggestions: validatedSuggestions,
        usageCount: updatedUsage,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (err instanceof GroqTimeoutError) {
      return NextResponse.json({ error: err.message }, { status: 504 });
    }

    const message =
      err instanceof Error ? err.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET endpoint to fetch current usage
export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const userId = token?.id as string | undefined;

  if (!userId) {
    return NextResponse.json(
      { error: 'You must be signed in.' },
      { status: 401 },
    );
  }

  const usageCount = dbOperations.getAISuggestionUsage(userId);

  return NextResponse.json(
    {
      usageCount,
      maxUsage: dbOperations.maxAISuggestionUsage,
    },
    { status: 200 },
  );
}
