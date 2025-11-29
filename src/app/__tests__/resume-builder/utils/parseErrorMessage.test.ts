import { describe, it, expect } from 'vitest';
import { parseErrorMessage } from '@resume-builder/components/resume-builder/utils/parseErrorMessage';

describe('parseErrorMessage', () => {
  it('should extract error message from response', async () => {
    const response = new Response(
      JSON.stringify({ error: 'Test error message' }),
      { status: 400 },
    );

    const message = await parseErrorMessage(response);

    expect(message).toBe('Test error message');
  });

  it('should extract message field when error is not present', async () => {
    const response = new Response(
      JSON.stringify({ message: 'Alternative error message' }),
      { status: 500 },
    );

    const message = await parseErrorMessage(response);

    expect(message).toBe('Alternative error message');
  });

  it('should return statusText when JSON parsing fails', async () => {
    const response = new Response('Invalid JSON', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    const message = await parseErrorMessage(response);

    expect(message).toBe('Internal Server Error');
  });

  it('should return default message when no error info available', async () => {
    const response = new Response('{}', {
      status: 500,
      statusText: '',
    });

    const message = await parseErrorMessage(response);

    expect(message).toBe('Unexpected error');
  });

  it('should handle non-string error values', async () => {
    const response = new Response(
      JSON.stringify({ error: { code: 123, message: 'Error' } }),
      { status: 400 },
    );

    const message = await parseErrorMessage(response);

    expect(message).toBe('Unexpected error');
  });

  it('should handle empty response body', async () => {
    const response = new Response('', {
      status: 500,
      statusText: 'Server Error',
    });

    const message = await parseErrorMessage(response);

    expect(message).toBe('Server Error');
  });
});
