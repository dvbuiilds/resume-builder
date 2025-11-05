import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ResumeDataProvider } from '@/components/resume-builder/context/ResumeDataContext';
import { LayoutProvider } from '@/components/resume-builder/context/LayoutContext';
import { ResumeThemeProvider } from '@/components/resume-builder/context/ResumeThemeContext';
import { useResumeData } from '@/components/resume-builder/context/ResumeDataContext';
import { useLayout } from '@/components/resume-builder/context/LayoutContext';
import { useResumeTheme } from '@/components/resume-builder/context/ResumeThemeContext';
import { mockWorkExperience, mockProjects } from '../test-utils/test-data';

describe('ResumeBuilder Integration Tests', () => {
  describe('Multiple Context Providers', () => {
    it('should allow all contexts to work together', () => {
      const { result: resumeData } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      const { result: theme } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      expect(resumeData.current.title).toBe('Enter Your Name');
      expect(layout.current.displayMode).toBe('preview');
      expect(theme.current.color).toBeTruthy();
      expect(theme.current.font).toBeTruthy();
    });

    it('should update resume data while maintaining layout state', () => {
      const { result: resumeData } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      act(() => {
        resumeData.current.updateTitle('Jane Smith');
      });

      expect(resumeData.current.title).toBe('Jane Smith');
      expect(layout.current.displayMode).toBe('preview');
    });

    it('should update layout while maintaining resume data', () => {
      const { result: resumeData } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      const initialTitle = resumeData.current.title;

      act(() => {
        layout.current.toggleDisplayMode('workExperience');
      });

      expect(layout.current.displayMode).toBe('edit');
      expect(layout.current.activeSection).toBe('workExperience');
      expect(resumeData.current.title).toBe(initialTitle);
    });

    it('should update theme while maintaining other states', () => {
      const { result: resumeData } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      const { result: theme } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      const initialTitle = resumeData.current.title;
      const initialDisplayMode = layout.current.displayMode;

      act(() => {
        theme.current.changeThemeColor('darkBlue');
      });

      expect(theme.current.color).toBeTruthy();
      expect(resumeData.current.title).toBe(initialTitle);
      expect(layout.current.displayMode).toBe(initialDisplayMode);
    });
  });

  describe('Edit Panel Toggling', () => {
    it('should toggle edit panel when section is clicked', () => {
      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      expect(layout.current.displayMode).toBe('preview');

      act(() => {
        layout.current.toggleDisplayMode('workExperience');
      });

      expect(layout.current.displayMode).toBe('edit');
      expect(layout.current.activeSection).toBe('workExperience');
    });

    it('should close edit panel and return to preview', () => {
      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      act(() => {
        layout.current.toggleDisplayMode('workExperience');
      });

      expect(layout.current.displayMode).toBe('edit');

      act(() => {
        layout.current.closeEditPanel();
      });

      expect(layout.current.displayMode).toBe('preview');
    });

    it('should switch between different sections', () => {
      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      act(() => {
        layout.current.toggleDisplayMode('workExperience');
      });

      expect(layout.current.activeSection).toBe('workExperience');

      act(() => {
        layout.current.toggleDisplayMode('education');
      });

      expect(layout.current.displayMode).toBe('edit');
      expect(layout.current.activeSection).toBe('education');
    });
  });

  describe('Resume Data Updates', () => {
    it('should update work experience', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateWorkExperience(mockWorkExperience);
      });

      expect(result.current.workExperience.experience).toHaveLength(2);
      expect(result.current.workExperience.experience[0].companyName).toBe(
        'Tech Corp',
      );
    });

    it('should update projects', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateProjects(mockProjects);
      });

      expect(result.current.projects.projects).toHaveLength(1);
      expect(result.current.projects.projects[0].projectTitle).toBe(
        'E-commerce Platform',
      );
    });

    it('should update multiple sections independently', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateTitle('John Doe');
        result.current.updateWorkExperience(mockWorkExperience);
      });

      expect(result.current.title).toBe('John Doe');
      expect(result.current.workExperience.experience).toHaveLength(2);
    });
  });

  describe('Theme Changes', () => {
    it('should change theme color', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('darkBlue');
      });

      expect(result.current.color).toBeTruthy();
    });

    it('should change theme font', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeFont('inter');
      });

      expect(result.current.font).toBeTruthy();
    });

    it('should change both color and font independently', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('darkGreen');
      });

      const colorAfterFirstChange = result.current.color;

      act(() => {
        result.current.changeThemeFont('cormorantGaramond');
      });

      expect(result.current.color).toBe(colorAfterFirstChange);
      expect(result.current.font).toBeTruthy();
    });
  });

  describe('Section Reordering', () => {
    it('should reorder sections', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      const initialOrder = [...result.current.sectionsOrder];

      act(() => {
        result.current.updateSectionsOrder((prev) => [
          ...prev.slice(1),
          prev[0],
        ]);
      });

      expect(result.current.sectionsOrder[0]).toBe(initialOrder[1]);
      expect(result.current.sectionsOrder[7]).toBe(initialOrder[0]);
    });

    it('should maintain section order while editing', () => {
      const { result } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      const initialOrder = [...result.current.sectionsOrder];

      act(() => {
        result.current.toggleDisplayMode('workExperience');
      });

      expect(result.current.sectionsOrder).toEqual(initialOrder);
      expect(result.current.displayMode).toBe('edit');
    });
  });

  describe('Complex User Flow', () => {
    it('should handle complete workflow: edit data, change theme, reorder sections', () => {
      const { result: resumeData } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      const { result: layout } = renderHook(() => useLayout(), {
        wrapper: LayoutProvider,
      });

      const { result: theme } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      // Step 1: Update resume data
      act(() => {
        resumeData.current.updateTitle('Jane Smith');
        resumeData.current.updateWorkExperience(mockWorkExperience);
      });

      expect(resumeData.current.title).toBe('Jane Smith');
      expect(resumeData.current.workExperience.experience).toHaveLength(2);

      // Step 2: Change theme
      act(() => {
        theme.current.changeThemeColor('darkBlue');
        theme.current.changeThemeFont('inter');
      });

      expect(theme.current.color).toBeTruthy();
      expect(theme.current.font).toBeTruthy();

      // Step 3: Open edit panel
      act(() => {
        layout.current.toggleDisplayMode('workExperience');
      });

      expect(layout.current.displayMode).toBe('edit');
      expect(layout.current.activeSection).toBe('workExperience');

      // Step 4: Reorder sections
      act(() => {
        layout.current.updateSectionsOrder((prev) => [
          ...prev.slice(1),
          prev[0],
        ]);
      });

      expect(layout.current.sectionsOrder[0]).toBe('socialHandles');

      // Step 5: Close edit panel
      act(() => {
        layout.current.closeEditPanel();
      });

      expect(layout.current.displayMode).toBe('preview');

      // Verify all changes are maintained
      expect(resumeData.current.title).toBe('Jane Smith');
      expect(theme.current.color).toBeTruthy();
      expect(layout.current.sectionsOrder[0]).toBe('socialHandles');
    });
  });
});
