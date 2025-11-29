import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUserResumes,
  refreshUserResumes,
} from '@resume-builder/components/resume-builder/utils/userResumeData';
import { useUserResumeStore } from '@resume-builder/components/resume-builder/store/userResumeStore';
import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';
import type { HistoryEntry } from '@resume-builder/components/resume-builder/context/HistoryContext';

vi.mock('@resume-builder/utils/fetchWithTimeout');
vi.mock(
  '@resume-builder/components/resume-builder/utils/parseErrorMessage',
  () => ({
    parseErrorMessage: vi.fn().mockResolvedValue('Error message'),
  }),
);

describe('userResumeData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserResumeStore.getState().clearResumes();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getUserResumes', () => {
    it('should return fresh data from store', async () => {
      const mockResumes: HistoryEntry[] = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Test"}',
          updatedAt: Date.now(),
        },
      ];

      useUserResumeStore.getState().setResumes(mockResumes);

      const result = await getUserResumes(false);

      expect(result).toEqual(mockResumes);
      expect(fetchWithTimeout).not.toHaveBeenCalled();
    });

    it('should fetch from API when store is empty', async () => {
      const mockResumes: HistoryEntry[] = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Test"}',
          updatedAt: Date.now(),
        },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockResumes }),
      };

      (fetchWithTimeout as any).mockResolvedValue(mockResponse);

      const result = await getUserResumes(false);

      expect(result).toEqual(mockResumes);
      expect(fetchWithTimeout).toHaveBeenCalled();
      expect(useUserResumeStore.getState().resumes).toEqual(mockResumes);
    });

    it('should fetch from API when data is stale', async () => {
      vi.useFakeTimers();
      const now = 1000000; // Fixed timestamp
      vi.setSystemTime(now);

      const oldTime = now - 6 * 60 * 1000; // 6 minutes ago

      const oldResumes: HistoryEntry[] = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Old"}',
          updatedAt: oldTime,
        },
      ];

      // Set resumes with old lastFetched timestamp
      useUserResumeStore.getState().setResumes(oldResumes);
      // Manually set lastFetched to old time to simulate stale data
      useUserResumeStore.setState({ lastFetched: oldTime });

      const newResumes: HistoryEntry[] = [
        {
          rowId: 'row-2',
          resumeId: 'resume-2',
          data: '{"title":"New"}',
          updatedAt: now,
        },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: newResumes }),
      };

      (fetchWithTimeout as any).mockResolvedValue(mockResponse);

      const result = await getUserResumes(false);

      expect(result).toEqual(newResumes);
      expect(fetchWithTimeout).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should force refresh when forceRefresh is true', async () => {
      const mockResumes: HistoryEntry[] = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Test"}',
          updatedAt: Date.now(),
        },
      ];

      useUserResumeStore.getState().setResumes(mockResumes);

      const newResumes: HistoryEntry[] = [
        {
          rowId: 'row-2',
          resumeId: 'resume-2',
          data: '{"title":"New"}',
          updatedAt: Date.now(),
        },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: newResumes }),
      };

      (fetchWithTimeout as any).mockResolvedValue(mockResponse);

      const result = await getUserResumes(true);

      expect(result).toEqual(newResumes);
      expect(fetchWithTimeout).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      (fetchWithTimeout as any).mockResolvedValue(mockResponse);

      await expect(getUserResumes()).rejects.toThrow();

      const state = useUserResumeStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it('should handle timeout errors with fallback message', async () => {
      (fetchWithTimeout as any).mockRejectedValue(
        new Error('Request timed out'),
      );

      await expect(getUserResumes()).rejects.toThrow('Something went wrong');

      const state = useUserResumeStore.getState();
      expect(state.error).toBe('Something went wrong. Please try again.');
    });

    it('should set loading state during fetch', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [] }),
      };

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (fetchWithTimeout as any).mockReturnValue(promise);

      const fetchPromise = getUserResumes();

      expect(useUserResumeStore.getState().isLoading).toBe(true);

      resolvePromise!(mockResponse);
      await fetchPromise;

      expect(useUserResumeStore.getState().isLoading).toBe(false);
    });
  });

  describe('refreshUserResumes', () => {
    it('should always fetch from API', async () => {
      const mockResumes: HistoryEntry[] = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Test"}',
          updatedAt: Date.now(),
        },
      ];

      useUserResumeStore.getState().setResumes(mockResumes);

      const newResumes: HistoryEntry[] = [
        {
          rowId: 'row-2',
          resumeId: 'resume-2',
          data: '{"title":"New"}',
          updatedAt: Date.now(),
        },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: newResumes }),
      };

      (fetchWithTimeout as any).mockResolvedValue(mockResponse);

      const result = await refreshUserResumes();

      expect(result).toEqual(newResumes);
      expect(fetchWithTimeout).toHaveBeenCalled();
    });
  });
});
