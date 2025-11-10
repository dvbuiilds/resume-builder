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

  const sizeBump = 0;
  const baseTitleSize = 18 + sizeBump;
  const baseHeadingSize = 14 + sizeBump;
  const baseTextSize = 12 + sizeBump;

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
      lineHeight: 1.2,
    },
    section: {
      marginBottom: 1,
      marginTop: 1,
    },
    heading: {
      fontSize: headingSize,
      fontWeight: 700,
      color,
      marginBottom: 2,
    },
    text: {
      fontSize: textSize,
      lineHeight: 1.2,
    },
    title: {
      fontSize: titleSize,
      fontWeight: 700,
      textAlign: 'center',
      marginBottom: 2,
      color,
    },
    subtitle: {
      fontSize: textSize,
      textAlign: 'center',
      marginBottom: 2,
    },
    link: {
      color,
      textDecoration: 'underline',
      fontSize: textSize,
    },
    horizontalRule: {
      borderBottom: `1px solid ${color}`,
      marginTop: 0,
      marginBottom: 2,
    },
    itemTitle: {
      fontSize: textSize,
      fontWeight: 500,
      marginBottom: 1,
    },
    itemSubtitle: {
      fontSize: textSize,
      fontStyle: 'italic',
      marginBottom: 1,
    },
    itemDate: {
      fontSize: textSize,
      color: '#666',
      marginBottom: 1,
    },
    itemDescription: {
      fontSize: textSize,
      marginBottom: 0.5,
      paddingLeft: 20,
    },
    bulletPoint: {
      fontSize: textSize,
      marginBottom: 1,
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
      marginBottom: 1,
    },
    column: {
      flexDirection: 'column',
    },
    flex1: {
      flex: 1,
    },
  });
};
