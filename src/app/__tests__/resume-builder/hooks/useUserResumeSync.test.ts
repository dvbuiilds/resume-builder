import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserResumeSync } from '@resume-builder/components/resume-builder/hooks/useUserResumeSync';
import { useUserResumeStore } from '@resume-builder/components/resume-builder/store/userResumeStore';
import { getUserResumes } from '@resume-builder/components/resume-builder/utils/userResumeData';

const mockUseSession = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

vi.mock(
  '@resume-builder/components/resume-builder/utils/userResumeData',
  () => ({
    getUserResumes: vi.fn(),
  }),
);

describe('useUserResumeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserResumeStore.getState().clearResumes();
    (getUserResumes as any).mockResolvedValue([]);
    mockUseSession.mockReturnValue({
      status: 'unauthenticated',
      data: null,
    });
  });

  it('should populate store on authentication', async () => {
    const mockResumes = [
      {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Test"}',
        updatedAt: Date.now(),
      },
    ];

    (getUserResumes as any).mockResolvedValue(mockResumes);

    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user-1' } },
    });

    renderHook(() => useUserResumeSync());

    await waitFor(() => {
      expect(getUserResumes).toHaveBeenCalled();
    });
  });

  it('should clear store on logout', async () => {
    // First set up authenticated state with data
    useUserResumeStore.getState().setResumes([
      {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Test"}',
        updatedAt: Date.now(),
      },
    ]);

    // First render as authenticated
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user-1' } },
    });

    const { rerender } = renderHook(() => useUserResumeSync());

    // Wait for initial load
    await waitFor(() => {
      expect(getUserResumes).toHaveBeenCalled();
    });

    // Then change to unauthenticated
    mockUseSession.mockReturnValue({
      status: 'unauthenticated',
      data: null,
    });

    rerender();

    expect(useUserResumeStore.getState().resumes).toEqual([]);
  });

  it('should not clear store if already unauthenticated', () => {
    mockUseSession.mockReturnValue({
      status: 'unauthenticated',
      data: null,
    });

    renderHook(() => useUserResumeSync());

    // Should not call clearResumes if already unauthenticated
    expect(useUserResumeStore.getState().resumes).toEqual([]);
  });

  it('should handle user change', async () => {
    (getUserResumes as any).mockResolvedValue([]);

    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user-1' } },
    });

    const { rerender } = renderHook(() => useUserResumeSync());

    await waitFor(() => {
      expect(getUserResumes).toHaveBeenCalledTimes(1);
    });

    // Change user
    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user-2' } },
    });

    rerender();

    await waitFor(() => {
      expect(getUserResumes).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle errors gracefully', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    (getUserResumes as any).mockRejectedValue(new Error('Failed to fetch'));

    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user-1' } },
    });

    renderHook(() => useUserResumeSync());

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });

  it('should not fetch if already initialized for same user', async () => {
    (getUserResumes as any).mockResolvedValue([]);

    mockUseSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user-1' } },
    });

    const { rerender } = renderHook(() => useUserResumeSync());

    await waitFor(() => {
      expect(getUserResumes).toHaveBeenCalledTimes(1);
    });

    // Rerender with same user
    rerender();

    // Should not fetch again
    expect(getUserResumes).toHaveBeenCalledTimes(1);
  });
});
