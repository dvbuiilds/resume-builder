import { NextResponse } from 'next/server';

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
): NextResponse {
  return NextResponse.json({ data }, { status });
}
