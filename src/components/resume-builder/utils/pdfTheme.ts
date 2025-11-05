import { StyleSheet } from '@react-pdf/renderer';
import type { ThemeColorValues, ThemeFontValues } from '../types/theme';

/**
 * Get PDF styles based on theme (color and font) with adaptive font sizing
 */
export const usePDFStyles = (
  color: ThemeColorValues,
  font: ThemeFontValues,
  scaleFactor: number = 1.0,
) => {
  const fontFamily =
    font === 'Cormorant Garamond'
      ? 'Cormorant Garamond'
      : font === 'Inter'
        ? 'Inter'
        : 'Times-Roman';

  // Base font sizes
  const baseTitleSize = 18;
  const baseHeadingSize = 14;
  const baseTextSize = 12;

  // Apply scaling with bounds
  const titleSize = Math.max(14, Math.min(22, baseTitleSize * scaleFactor));
  const headingSize = Math.max(12, Math.min(16, baseHeadingSize * scaleFactor));
  const textSize = Math.max(10, Math.min(14, baseTextSize * scaleFactor));

  return StyleSheet.create({
    page: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 30,
      fontFamily,
      fontSize: textSize,
      lineHeight: 1.4,
    },
    section: {
      marginBottom: 1,
      marginTop: 1,
    },
    heading: {
      fontSize: headingSize,
      fontWeight: 500,
      color,
      marginBottom: 4,
    },
    text: {
      fontSize: textSize,
      lineHeight: 1.4,
    },
    title: {
      fontSize: titleSize,
      fontWeight: 500,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: textSize,
      textAlign: 'center',
      marginBottom: 4,
    },
    link: {
      color,
      textDecoration: 'none',
      fontSize: textSize,
    },
    horizontalRule: {
      borderBottom: `1px solid ${color}`,
      marginTop: 0,
      marginBottom: 4,
    },
    itemTitle: {
      fontSize: textSize,
      fontWeight: 500,
      marginBottom: 2,
    },
    itemSubtitle: {
      fontSize: textSize,
      fontStyle: 'italic',
      marginBottom: 2,
    },
    itemDate: {
      fontSize: textSize,
      color: '#666',
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: textSize,
      marginBottom: 1,
      paddingLeft: 20,
    },
    bulletPoint: {
      fontSize: textSize,
      marginBottom: 2,
    },
    skillTitle: {
      fontSize: textSize,
      fontWeight: 500,
      marginBottom: 0,
    },
    skillList: {
      fontSize: textSize,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    column: {
      flexDirection: 'column',
    },
    flex1: {
      flex: 1,
    },
  });
};
