import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';

describe('fetchWithTimeout', () => {
  const originalFetch = global.fetch;
  const originalAbortController = global.AbortController;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.AbortController = originalAbortController;
  });

  it('should resolve when request completes within timeout', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
    });
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout('/api/test', {}, 1000);

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should reject when request times out', async () => {
    vi.useFakeTimers();

    const fetchPromise = new Promise<Response>((resolve) => {
      setTimeout(() => resolve(new Response()), 2000);
    });

    (global.fetch as any).mockReturnValue(fetchPromise);

    const timeoutPromise = fetchWithTimeout('/api/test', {}, 100);

    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(100);

    await expect(timeoutPromise).rejects.toThrow('timed out');

    vi.useRealTimers();
  });

  it('should use default timeout when not specified', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
    });
    (global.fetch as any).mockResolvedValue(mockResponse);

    await fetchWithTimeout('/api/test');

    expect(global.fetch).toHaveBeenCalled();
  });

  it('should handle abort signal from user', async () => {
    const abortController = new AbortController();
    abortController.abort();

    (global.fetch as any).mockRejectedValue(new Error('Aborted'));

    await expect(
      fetchWithTimeout('/api/test', { signal: abortController.signal }, 1000),
    ).rejects.toThrow();
  });

  it('should pass through fetch options', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
    });
    (global.fetch as any).mockResolvedValue(mockResponse);

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    };

    await fetchWithTimeout('/api/test', options, 1000);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        headers: options.headers,
        body: options.body,
      }),
    );
  });

  it('should handle fetch errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(fetchWithTimeout('/api/test', {}, 1000)).rejects.toThrow(
      'Network error',
    );
  });
});
