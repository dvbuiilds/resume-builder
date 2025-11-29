import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResumeFontStyles } from '@resume-builder/components/resume-builder/hooks/useResumeFontStyles';
import type { ThemeFontValues } from '@resume-builder/components/resume-builder/types/theme';

describe('useResumeFontStyles', () => {
  const cormorantGaramondClassName = 'font-cormorant';
  const interClassName = 'font-inter';

  describe('Cormorant Garamond font', () => {
    it('should return correct className for Cormorant Garamond', () => {
      const { result } = renderHook(() =>
        useResumeFontStyles({
          font: 'Cormorant Garamond',
          cormorantGaramondClassName,
          interClassName,
        }),
      );

      // Implementation adds 'cormorant-scale' to the className
      expect(result.current.className).toBe(
        `${cormorantGaramondClassName} cormorant-scale`,
      );
      expect(result.current.style).toEqual({});
    });
  });

  describe('Inter font', () => {
    it('should return correct className for Inter', () => {
      const { result } = renderHook(() =>
        useResumeFontStyles({
          font: 'Inter',
          cormorantGaramondClassName,
          interClassName,
        }),
      );

      expect(result.current.className).toBe(interClassName);
      expect(result.current.style).toEqual({});
    });
  });

  describe('Times New Roman font', () => {
    it('should return correct inline style for Times New Roman', () => {
      const { result } = renderHook(() =>
        useResumeFontStyles({
          font: 'Times New Roman',
          cormorantGaramondClassName,
          interClassName,
        }),
      );

      expect(result.current.className).toBe('');
      expect(result.current.style).toEqual({
        fontFamily: 'Times New Roman, serif',
      });
    });
  });

  describe('Memoization', () => {
    it('should return same object reference when font does not change', () => {
      const { result, rerender } = renderHook(
        (props) => useResumeFontStyles(props),
        {
          initialProps: {
            font: 'Inter' as const,
            cormorantGaramondClassName,
            interClassName,
          },
        },
      );

      const firstResult = result.current;

      rerender({
        font: 'Inter',
        cormorantGaramondClassName,
        interClassName,
      });

      expect(result.current).toBe(firstResult);
    });

    it('should return new object reference when font changes', () => {
      const { result, rerender } = renderHook(
        (props: {
          font: ThemeFontValues;
          cormorantGaramondClassName: string;
          interClassName: string;
        }) => useResumeFontStyles(props),
        {
          initialProps: {
            font: 'Inter' as ThemeFontValues,
            cormorantGaramondClassName,
            interClassName,
          },
        },
      );

      const firstResult = result.current;

      // Change font to trigger new object
      rerender({
        font: 'Cormorant Garamond' as ThemeFontValues,
        cormorantGaramondClassName,
        interClassName,
      });

      expect(result.current).not.toBe(firstResult);
      expect(result.current.className).toBe(
        `${cormorantGaramondClassName} cormorant-scale`,
      );
    });

    it('should return new object reference when className props change', () => {
      const { result, rerender } = renderHook(
        (props) => useResumeFontStyles(props),
        {
          initialProps: {
            font: 'Inter' as const,
            cormorantGaramondClassName,
            interClassName,
          },
        },
      );

      const firstResult = result.current;

      rerender({
        font: 'Inter',
        cormorantGaramondClassName: 'font-cormorant-new',
        interClassName,
      });

      // Even though font is same, className prop changed, so memoization should update
      expect(result.current).not.toBe(firstResult);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty className strings', () => {
      const { result } = renderHook(() =>
        useResumeFontStyles({
          font: 'Inter',
          cormorantGaramondClassName: '',
          interClassName: '',
        }),
      );

      expect(result.current.className).toBe('');
      expect(result.current.style).toEqual({});
    });

    it('should handle all three font types', () => {
      const fonts: Array<'Cormorant Garamond' | 'Inter' | 'Times New Roman'> = [
        'Cormorant Garamond',
        'Inter',
        'Times New Roman',
      ];

      fonts.forEach((font) => {
        const { result } = renderHook(() =>
          useResumeFontStyles({
            font,
            cormorantGaramondClassName,
            interClassName,
          }),
        );

        if (font === 'Cormorant Garamond') {
          expect(result.current.className).toBe(
            `${cormorantGaramondClassName} cormorant-scale`,
          );
          expect(result.current.style).toEqual({});
        } else if (font === 'Inter') {
          expect(result.current.className).toBe(interClassName);
          expect(result.current.style).toEqual({});
        } else {
          expect(result.current.className).toBe('');
          expect(result.current.style).toEqual({
            fontFamily: 'Times New Roman, serif',
          });
        }
      });
    });
  });
});
