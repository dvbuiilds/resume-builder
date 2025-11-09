import {
  themeColorsReadOnly,
  themeFontsReadOnly,
} from '../config/theme-config';

// Theme Color Keys
export type ThemeColorKeys = keyof typeof themeColorsReadOnly;

// Theme Color Values
export type ThemeColorValues = (typeof themeColorsReadOnly)[ThemeColorKeys];

// Theme Font Keys
export type ThemeFontKeys = keyof typeof themeFontsReadOnly;

// Theme Font Values
export type ThemeFontValues = (typeof themeFontsReadOnly)[ThemeFontKeys];
