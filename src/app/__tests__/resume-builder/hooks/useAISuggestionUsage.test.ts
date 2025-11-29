import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAISuggestionUsage } from '@resume-builder/components/resume-builder/hooks/useAISuggestionUsage';
import { afterEach } from 'node:test';

const originalFetch = global.fetch;

describe('useAISuggestionUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should fetch usage count on mount', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ usageCount: 5, maxUsage: 10 }),
    });

    const { result } = renderHook(() => useAISuggestionUsage());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.usageCount).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it('should handle 401 response (unauthenticated)', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAISuggestionUsage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.usageCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAISuggestionUsage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.usageCount).toBe(0);
    expect(result.current.error).toBe('Network error');

    consoleErrorSpy.mockRestore();
  });

  it('should handle non-ok responses', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useAISuggestionUsage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.usageCount).toBe(0);
    expect(result.current.error).toBeTruthy();

    consoleErrorSpy.mockRestore();
  });

  it('should provide refetch function', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ usageCount: 3, maxUsage: 10 }),
    });

    const { result } = renderHook(() => useAISuggestionUsage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.usageCount).toBe(3);

    // Update mock for refetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ usageCount: 4, maxUsage: 10 }),
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.usageCount).toBe(4);
    });
  });
});
