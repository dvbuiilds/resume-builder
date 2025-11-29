import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPanel } from '@resume-builder/components/resume-builder/components/history/HistoryPanel';
import { useHistory } from '@resume-builder/components/resume-builder/context/HistoryContext';
import { useResumeStore } from '@resume-builder/components/resume-builder/store/resumeStore';
import { hydrateResumeFromHistory } from '@resume-builder/components/resume-builder/store/resumePersistence';
import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';
import { render as customRender } from '../../test-utils/render-with-providers';

vi.mock(
  '@resume-builder/components/resume-builder/context/HistoryContext',
  () => ({
    useHistory: vi.fn(),
  }),
);

vi.mock('@resume-builder/components/resume-builder/store/resumeStore', () => ({
  useResumeStore: vi.fn(),
}));

vi.mock(
  '@resume-builder/components/resume-builder/store/resumePersistence',
  () => ({
    hydrateResumeFromHistory: vi.fn(),
  }),
);

vi.mock('@resume-builder/utils/fetchWithTimeout', () => ({
  default: vi.fn(),
}));

// Mock fetch for AISuggestionUsageProvider
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ usageCount: 0, maxUsage: 10 }),
  } as Response),
) as any;

describe('HistoryPanel', () => {
  const mockRefresh = vi.fn();
  const mockEntries = [
    {
      rowId: 'row-1',
      resumeId: 'resume-1',
      data: '{"title":"Resume 1"}',
      updatedAt: Date.now(),
    },
    {
      rowId: 'row-2',
      resumeId: 'resume-2',
      data: '{"title":"Resume 2"}',
      updatedAt: Date.now() - 1000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useHistory as any).mockReturnValue({
      entries: mockEntries,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });
    (useResumeStore as any).mockReturnValue('resume-1');
    (hydrateResumeFromHistory as any).mockReturnValue({ title: 'Resume 1' });
  });

  it('should render resume list', () => {
    customRender(<HistoryPanel />);

    expect(screen.getByText('Resume 1')).toBeInTheDocument();
    expect(screen.getByText('Resume 2')).toBeInTheDocument();
  });

  it('should show empty state when no resumes', () => {
    (useHistory as any).mockReturnValue({
      entries: [],
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    customRender(<HistoryPanel />);

    expect(screen.getByText(/no saved resumes/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useHistory as any).mockReturnValue({
      entries: [],
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    customRender(<HistoryPanel />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    (useHistory as any).mockReturnValue({
      entries: [],
      loading: false,
      error: 'Failed to load resumes',
      refresh: mockRefresh,
    });

    customRender(<HistoryPanel />);

    expect(screen.getByText('Failed to load resumes')).toBeInTheDocument();
  });

  it('should select resume on click', async () => {
    const user = userEvent.setup();
    customRender(<HistoryPanel />);

    const resumeItem = screen.getByText('Resume 2');
    await user.click(resumeItem);

    expect(hydrateResumeFromHistory).toHaveBeenCalledWith(
      '{"title":"Resume 2"}',
      'resume-2',
    );
  });

  it('should show error when resume cannot be hydrated', async () => {
    const user = userEvent.setup();
    (hydrateResumeFromHistory as any).mockReturnValue(null);

    customRender(<HistoryPanel />);

    const resumeItem = screen.getByText('Resume 2');
    await user.click(resumeItem);

    await waitFor(() => {
      expect(
        screen.getByText(/unable to load this resume/i),
      ).toBeInTheDocument();
    });
  });

  it('should delete resume', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [mockEntries[1]],
      }),
    };

    (fetchWithTimeout as any).mockResolvedValue(mockResponse);

    customRender(<HistoryPanel />);

    const deleteButtons = screen.getAllByTitle('Delete resume');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(fetchWithTimeout).toHaveBeenCalled();
    });
  });

  it('should show error on delete failure', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: false,
      status: 500,
    };

    (fetchWithTimeout as any).mockResolvedValue(mockResponse);

    customRender(<HistoryPanel />);

    const deleteButtons = screen.getAllByTitle('Delete resume');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/failed to delete/i)).toBeInTheDocument();
    });
  });

  it('should prevent deleting active resume', async () => {
    const user = userEvent.setup();
    (useResumeStore as any).mockReturnValue('resume-1');

    customRender(<HistoryPanel />);

    const deleteButtons = screen.getAllByTitle(/delete/i);
    const activeDeleteButton = deleteButtons.find((btn) =>
      btn.getAttribute('title')?.includes('Cannot delete'),
    );

    expect(activeDeleteButton).toBeDisabled();
  });

  it('should restore deleted resume', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: mockEntries,
      }),
    };

    (fetchWithTimeout as any).mockResolvedValue(mockResponse);

    customRender(<HistoryPanel />);

    // First delete
    const deleteButtons = screen.getAllByTitle('Delete resume');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/resume deleted/i)).toBeInTheDocument();
    });

    // Then restore
    const restoreButton = screen.getByText(/undo/i);
    await user.click(restoreButton);

    await waitFor(() => {
      expect(fetchWithTimeout).toHaveBeenCalled();
    });
  });

  it('should refresh resumes', async () => {
    const user = userEvent.setup();
    customRender(<HistoryPanel />);

    // Find refresh button by text content
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalled();
  });
});
