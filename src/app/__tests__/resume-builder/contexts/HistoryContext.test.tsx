import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  HistoryProvider,
  useHistory,
} from '@resume-builder/components/resume-builder/context/HistoryContext';
import { useUserResumeStore } from '@resume-builder/components/resume-builder/store/userResumeStore';
import {
  getUserResumes,
  refreshUserResumes,
} from '@resume-builder/components/resume-builder/utils/userResumeData';

vi.mock(
  '@resume-builder/components/resume-builder/utils/userResumeData',
  () => ({
    getUserResumes: vi.fn(),
    refreshUserResumes: vi.fn(),
  }),
);

describe('HistoryContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserResumeStore.getState().clearResumes();
    (getUserResumes as any).mockResolvedValue([]);
    (refreshUserResumes as any).mockResolvedValue([]);
  });

  describe('useHistory hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useHistory());
      }).toThrow('useHistory must be used within a HistoryProvider');

      consoleSpy.mockRestore();
    });

    it('should provide initial state values', () => {
      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      expect(result.current.entries).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.setEntries).toBe('function');
    });

    it('should sync with store state', () => {
      const mockResumes = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Test"}',
          updatedAt: Date.now(),
        },
      ];

      useUserResumeStore.getState().setResumes(mockResumes);
      useUserResumeStore.getState().setLoading(true);
      useUserResumeStore.getState().setError('Test error');

      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      expect(result.current.entries).toEqual(mockResumes);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe('Test error');
    });

    it('should update entries when store changes', () => {
      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      const newResumes = [
        {
          rowId: 'row-2',
          resumeId: 'resume-2',
          data: '{"title":"New"}',
          updatedAt: Date.now(),
        },
      ];

      act(() => {
        useUserResumeStore.getState().setResumes(newResumes);
      });

      expect(result.current.entries).toEqual(newResumes);
    });

    it('should call getUserResumes on mount', async () => {
      renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      await waitFor(() => {
        expect(getUserResumes).toHaveBeenCalled();
      });
    });

    it('should refresh resumes when refresh is called', async () => {
      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(refreshUserResumes).toHaveBeenCalled();
    });

    it('should handle refresh errors', async () => {
      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      (refreshUserResumes as any).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });

    it('should handle timeout errors with fallback message', async () => {
      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      (refreshUserResumes as any).mockRejectedValue(
        new Error('Request timed out'),
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error).toBe(
        'Something went wrong. Please try again.',
      );
    });

    it('should allow setting entries directly', () => {
      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      const newEntries = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Direct Set"}',
          updatedAt: Date.now(),
        },
      ];

      act(() => {
        result.current.setEntries(newEntries);
      });

      expect(result.current.entries).toEqual(newEntries);
    });

    it('should update loading state during refresh', async () => {
      let resolveRefresh: (value: any) => void;
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });

      (refreshUserResumes as any).mockReturnValue(refreshPromise);

      const { result } = renderHook(() => useHistory(), {
        wrapper: HistoryProvider,
      });

      act(() => {
        result.current.refresh();
      });

      expect(result.current.loading).toBe(true);

      act(() => {
        resolveRefresh!([]);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
