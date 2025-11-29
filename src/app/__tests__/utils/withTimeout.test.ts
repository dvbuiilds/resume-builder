import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withTimeout } from '@resume-builder/utils/withTimeout';
import { GroqTimeoutError } from '@resume-builder/llms/groq/groq';

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve when promise completes before timeout', async () => {
    const promise = Promise.resolve('success');

    const resultPromise = withTimeout(promise, 1000);
    vi.advanceTimersByTime(500);

    const result = await resultPromise;
    expect(result).toBe('success');
  });

  it('should reject with timeout error when promise exceeds timeout', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), 2000);
    });

    const resultPromise = withTimeout(promise, 1000);
    vi.advanceTimersByTime(1000);

    await expect(resultPromise).rejects.toBeInstanceOf(GroqTimeoutError);
  });

  it('should handle promise rejection before timeout', async () => {
    const promise = Promise.reject(new Error('Test error'));

    await expect(withTimeout(promise, 1000)).rejects.toThrow('Test error');
  });

  it('should use custom error factory when provided', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), 2000);
    });

    const customErrorFactory = (ms: number) =>
      new Error(`Custom timeout: ${ms}ms`);
    const resultPromise = withTimeout(promise, 1000, customErrorFactory);
    vi.advanceTimersByTime(1000);

    await expect(resultPromise).rejects.toThrow('Custom timeout: 1000ms');
  });

  it('should clear timeout when promise resolves', async () => {
    const promise = Promise.resolve('success');
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    await withTimeout(promise, 1000);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
