import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditPanel } from '@resume-builder/components/resume-builder/components/edit-panel/EditPanel';
import { useLayout } from '@resume-builder/components/resume-builder/context/LayoutContext';
import { useHistory } from '@resume-builder/components/resume-builder/context/HistoryContext';
import { getResumeSnapshotForSave } from '@resume-builder/components/resume-builder/store/resumePersistence';
import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';
import { refreshUserResumes } from '@resume-builder/components/resume-builder/utils/userResumeData';
import { render as customRender } from '../../test-utils/render-with-providers';

vi.mock(
  '@resume-builder/components/resume-builder/context/LayoutContext',
  async () => {
    const actual = await vi.importActual(
      '@resume-builder/components/resume-builder/context/LayoutContext',
    );
    return {
      ...actual,
      useLayout: vi.fn(),
    };
  },
);

vi.mock(
  '@resume-builder/components/resume-builder/context/HistoryContext',
  () => ({
    useHistory: vi.fn(),
  }),
);

vi.mock(
  '@resume-builder/components/resume-builder/store/resumePersistence',
  () => ({
    getResumeSnapshotForSave: vi.fn(),
  }),
);

vi.mock('@resume-builder/utils/fetchWithTimeout', () => ({
  default: vi.fn(),
}));

vi.mock(
  '@resume-builder/components/resume-builder/utils/userResumeData',
  () => ({
    refreshUserResumes: vi.fn(),
  }),
);

// Mock fetch for AISuggestionUsageProvider
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ usageCount: 0, maxUsage: 10 }),
  } as Response),
) as any;

describe('EditPanel', () => {
  const mockUpdateActiveSection = vi.fn();
  const mockSetEntries = vi.fn();
  const mockCloseEditPanel = vi.fn();

  const mockLayout = {
    activeSection: 'workExperience',
    sectionsOrder: ['title', 'workExperience', 'education'],
    closeEditPanel: mockCloseEditPanel,
    updateActiveSection: mockUpdateActiveSection,
  };

  const mockHistory = {
    entries: [
      {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Test"}',
        updatedAt: Date.now(),
      },
    ],
    setEntries: mockSetEntries,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLayout as any).mockReturnValue(mockLayout);
    (useHistory as any).mockReturnValue(mockHistory);
    (getResumeSnapshotForSave as any).mockReturnValue({
      resumeId: 'resume-1',
      serialized: '{"title":"Test"}',
    });
  });

  it('should render edit panel with sections', () => {
    customRender(<EditPanel />);

    expect(screen.getByText(/edit panel/i)).toBeInTheDocument();
    expect(screen.getByText(/sections/i)).toBeInTheDocument();
    expect(screen.getByText(/theme/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('should render save button', () => {
    customRender(<EditPanel />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should save resume successfully', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [
          {
            rowId: 'row-1',
            resumeId: 'resume-1',
            data: '{"title":"Saved"}',
            updatedAt: Date.now(),
          },
        ],
      }),
    };

    (fetchWithTimeout as any).mockResolvedValue(mockResponse);
    (refreshUserResumes as any).mockResolvedValue([]);

    customRender(<EditPanel />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
    });

    expect(fetchWithTimeout).toHaveBeenCalled();
    expect(mockSetEntries).toHaveBeenCalled();
  });

  it('should show error message on save failure', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: false,
      status: 500,
    };

    (fetchWithTimeout as any).mockResolvedValue(mockResponse);

    customRender(<EditPanel />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  it('should disable save button while saving', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const savePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (fetchWithTimeout as any).mockReturnValue(savePromise);

    customRender(<EditPanel />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();

    resolvePromise!({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    (fetchWithTimeout as any).mockRejectedValue(new Error('Network error'));

    customRender(<EditPanel />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
