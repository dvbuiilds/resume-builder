import { createContext, useContext, useState } from 'react';

// TYPES
import type {
  ThemeColorKeys,
  ThemeColorValues,
  ThemeFontKeys,
  ThemeFontValues,
} from '../types/theme';

// CONFIGS
import {
  themeColorsReadOnly,
  themeFontsReadOnly,
} from '../config/theme-config';

interface ResumeThemeContextType {
  color: ThemeColorValues;
  changeThemeColor: (colorKey: ThemeColorKeys) => void;
  font: ThemeFontValues;
  changeThemeFont: (fontKey: ThemeFontKeys) => void;
}

export const ResumeThemeContext = createContext<ResumeThemeContextType>({
  color: themeColorsReadOnly.black,
  changeThemeColor: (_colorKey: ThemeColorKeys) => {},
  font: themeFontsReadOnly.timesNewRoman,
  changeThemeFont: (_fontKey: ThemeFontKeys) => {},
});

export const ResumeThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [color, updateThemeColor] = useState<ThemeColorValues>(
    themeColorsReadOnly.black,
  );
  const [font, updateThemeFont] = useState<ThemeFontValues>(
    themeFontsReadOnly.timesNewRoman,
  );

  const changeThemeColor = (colorKey: ThemeColorKeys) => {
    updateThemeColor(themeColorsReadOnly[colorKey]);
  };

  const changeThemeFont = (fontKey: ThemeFontKeys) => {
    updateThemeFont(themeFontsReadOnly[fontKey]);
  };

  return (
    <ResumeThemeContext.Provider
      value={{ color, changeThemeColor, font, changeThemeFont }}
    >
      {children}
    </ResumeThemeContext.Provider>
  );
};

export const useResumeTheme = () => {
  const context = useContext(ResumeThemeContext);

  if (!context) {
    throw new Error('useResumeTheme must be used within a ThemeProvider');
  }

  return context;
};
