import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleEditBox } from '@resume-builder/components/resume-builder/components/edit-panel/TitleEditBox';
import { useResumeStore } from '@resume-builder/components/resume-builder/store/resumeStore';
import { render as customRender } from '../../test-utils/render-with-providers';

vi.mock('@resume-builder/components/resume-builder/store/resumeStore', () => ({
  useResumeStore: vi.fn(),
}));

// Mock fetch for AISuggestionUsageProvider
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ usageCount: 0, maxUsage: 10 }),
  } as Response),
) as any;

describe('TitleEditBox', () => {
  const mockSetTitle = vi.fn();
  const mockTitle = 'Test Name';

  beforeEach(() => {
    vi.clearAllMocks();
    (useResumeStore as any).mockImplementation((selector: any) => {
      if (selector.toString().includes('title')) {
        return selector({ title: mockTitle, setTitle: mockSetTitle });
      }
      return selector({ setTitle: mockSetTitle });
    });
  });

  it('should render with current title', () => {
    customRender(<TitleEditBox />);

    const inputs = screen.getAllByDisplayValue(mockTitle);
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should update title on input change', async () => {
    const user = userEvent.setup();
    customRender(<TitleEditBox />);

    const inputs = screen.getAllByDisplayValue(mockTitle);
    const input = inputs[0];
    await user.clear(input);
    await user.type(input, 'New Name');

    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('should handle empty input', async () => {
    const user = userEvent.setup();
    customRender(<TitleEditBox />);

    const inputs = screen.getAllByDisplayValue(mockTitle);
    const input = inputs[0];
    await user.clear(input);

    expect(mockSetTitle).toHaveBeenCalled();
  });
});
