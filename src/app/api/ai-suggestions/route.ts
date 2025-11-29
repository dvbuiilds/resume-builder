import { NextRequest, NextResponse } from 'next/server';
import {
  getDescriptionSuggestionsWithGroq,
  GroqTimeoutError,
} from '@resume-builder/llms/groq/groq';
import { validateAISuggestionResponse } from '@resume-builder/components/resume-builder/types/ai-suggestion-schema';
import { withTimeout } from '@resume-builder/utils/withTimeout';
import { dbOperations } from '@resume-builder/lib/db';
import { requireAuth } from '@resume-builder/lib/api-auth';
import {
  createErrorResponse,
  createSuccessResponse,
} from '@resume-builder/lib/api-utils';

const GROQ_TIMEOUT_MS = 60_000;

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(
      req,
      'You must be signed in to use AI suggestions.',
    );
    const { userId } = session;

    // Check usage limit (resets after 24h)
    const currentUsage = dbOperations.getAISuggestionUsage(userId);
    if (currentUsage >= dbOperations.maxAISuggestionUsage) {
      return createErrorResponse(
        'You have reached the maximum number of AI suggestions allowed (10 per 24 hours). Please try again later.',
        429,
      );
    }

    const payload = await req.json();
    const { description, jobRole, companyName } = payload;

    if (!description || typeof description !== 'string') {
      return createErrorResponse('Missing or invalid description string.', 400);
    }

    if (description.trim().length === 0) {
      return createErrorResponse('Description cannot be empty.', 400);
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
      return createErrorResponse('AI did not return valid suggestions.', 502);
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

// GET endpoint to fetch current usage
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req, 'You must be signed in.');
    const { userId } = session;

    const usageCount = dbOperations.getAISuggestionUsage(userId);

    return NextResponse.json(
      {
        usageCount,
        maxUsage: dbOperations.maxAISuggestionUsage,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (err instanceof NextResponse) {
      // Auth error from requireAuth
      return err;
    }

    const message =
      err instanceof Error ? err.message : 'Internal server error';

    return createErrorResponse(message, 500);
  }
}
