import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  AISuggestionUsageProvider,
  useAISuggestionUsageContext,
} from '@resume-builder/components/resume-builder/context/AISuggestionUsageContext';

const originalFetch = global.fetch;

describe('AISuggestionUsageContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('useAISuggestionUsageContext hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAISuggestionUsageContext());
      }).toThrow(
        'useAISuggestionUsageContext must be used within AISuggestionUsageProvider',
      );

      consoleSpy.mockRestore();
    });

    it('should provide initial state values', () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ usageCount: 0, maxUsage: 10 }),
      });

      const { result } = renderHook(() => useAISuggestionUsageContext(), {
        wrapper: AISuggestionUsageProvider,
      });

      expect(result.current.usageCount).toBe(0);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should fetch usage count on mount', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ usageCount: 5, maxUsage: 10 }),
      });

      const { result } = renderHook(() => useAISuggestionUsageContext(), {
        wrapper: AISuggestionUsageProvider,
      });

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

      const { result } = renderHook(() => useAISuggestionUsageContext(), {
        wrapper: AISuggestionUsageProvider,
      });

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

      const { result } = renderHook(() => useAISuggestionUsageContext(), {
        wrapper: AISuggestionUsageProvider,
      });

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

      const { result } = renderHook(() => useAISuggestionUsageContext(), {
        wrapper: AISuggestionUsageProvider,
      });

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

      const { result } = renderHook(() => useAISuggestionUsageContext(), {
        wrapper: AISuggestionUsageProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.usageCount).toBe(3);

      // Update mock for refetch
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ usageCount: 7, maxUsage: 10 }),
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.usageCount).toBe(7);
      });
    });

    it('should handle missing usageCount in response', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ maxUsage: 10 }),
      });

      const { result } = renderHook(() => useAISuggestionUsageContext(), {
        wrapper: AISuggestionUsageProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.usageCount).toBe(0);
    });
  });
});
