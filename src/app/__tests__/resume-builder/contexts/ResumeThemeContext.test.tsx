import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  ResumeThemeProvider,
  useResumeTheme,
} from '@/components/resume-builder/context/ResumeThemeContext';
import {
  themeColorsReadOnly,
  themeFontsReadOnly,
} from '@/components/resume-builder/config/theme-config';

describe('ResumeThemeContext', () => {
  describe('useResumeTheme hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useResumeTheme());
      }).toThrow('useResumeTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should provide initial theme values', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      expect(result.current.color).toBe(themeColorsReadOnly.black);
      expect(result.current.font).toBe(themeFontsReadOnly.timesNewRoman);
    });

    it('should provide theme change functions', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      expect(typeof result.current.changeThemeColor).toBe('function');
      expect(typeof result.current.changeThemeFont).toBe('function');
    });
  });

  describe('changeThemeColor', () => {
    it('should change theme color to blue', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('darkBlue');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.darkBlue);
    });

    it('should change theme color to green', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('darkGreen');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.darkGreen);
    });

    it('should change theme color to darkRed', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('darkRed');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.darkRed);
    });

    it('should change theme color to orange', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('orange');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.orange);
    });

    it('should change theme color back to black', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('darkBlue');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.darkBlue);

      act(() => {
        result.current.changeThemeColor('black');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.black);
    });
  });

  describe('changeThemeFont', () => {
    it('should change font to Cormorant Garamond', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeFont('cormorantGaramond');
      });

      expect(result.current.font).toBe(themeFontsReadOnly.cormorantGaramond);
    });

    it('should change font to Inter', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeFont('inter');
      });

      expect(result.current.font).toBe(themeFontsReadOnly.inter);
    });

    it('should change font back to Times New Roman', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeFont('inter');
      });

      expect(result.current.font).toBe(themeFontsReadOnly.inter);

      act(() => {
        result.current.changeThemeFont('timesNewRoman');
      });

      expect(result.current.font).toBe(themeFontsReadOnly.timesNewRoman);
    });
  });

  describe('Theme persistence', () => {
    it('should maintain color and font independently', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      act(() => {
        result.current.changeThemeColor('darkBlue');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.darkBlue);
      expect(result.current.font).toBe(themeFontsReadOnly.timesNewRoman);

      act(() => {
        result.current.changeThemeFont('inter');
      });

      expect(result.current.color).toBe(themeColorsReadOnly.darkBlue);
      expect(result.current.font).toBe(themeFontsReadOnly.inter);
    });

    it('should allow multiple color changes', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      const colors: Array<
        'black' | 'darkBlue' | 'darkGreen' | 'darkRed' | 'orange'
      > = ['black', 'darkBlue', 'darkGreen', 'darkRed', 'orange'];

      colors.forEach((color) => {
        act(() => {
          result.current.changeThemeColor(color);
        });

        expect(result.current.color).toBe(themeColorsReadOnly[color]);
      });
    });

    it('should allow multiple font changes', () => {
      const { result } = renderHook(() => useResumeTheme(), {
        wrapper: ResumeThemeProvider,
      });

      const fonts: Array<'timesNewRoman' | 'cormorantGaramond' | 'inter'> = [
        'timesNewRoman',
        'cormorantGaramond',
        'inter',
      ];

      fonts.forEach((font) => {
        act(() => {
          result.current.changeThemeFont(font);
        });

        expect(result.current.font).toBe(themeFontsReadOnly[font]);
      });
    });
  });
});
