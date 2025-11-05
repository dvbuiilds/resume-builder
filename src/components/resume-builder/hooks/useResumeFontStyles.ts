import { useMemo } from 'react';
import type { ThemeFontValues } from '../types/theme';

interface FontStyles {
  className: string;
  style: React.CSSProperties;
}

interface UseResumeFontStylesProps {
  font: ThemeFontValues;
  cormorantGaramondClassName: string;
  interClassName: string;
}

export const useResumeFontStyles = ({
  font,
  cormorantGaramondClassName,
  interClassName,
}: UseResumeFontStylesProps): FontStyles => {
  return useMemo(() => {
    const getFontClassName = () => {
      if (font === 'Cormorant Garamond') {
        return `${cormorantGaramondClassName} cormorant-scale`;
      }
      if (font === 'Inter') {
        return interClassName;
      }
      return '';
    };

    const getFontStyle = (): React.CSSProperties => {
      if (font === 'Times New Roman') {
        return { fontFamily: 'Times New Roman, serif' };
      }
      return {};
    };

    return {
      className: getFontClassName(),
      style: getFontStyle(),
    };
  }, [font, cormorantGaramondClassName, interClassName]);
};
