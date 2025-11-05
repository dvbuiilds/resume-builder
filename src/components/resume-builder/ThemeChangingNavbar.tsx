import React from 'react';

// HOOKS
import { useResumeTheme } from './context/ResumeThemeContext';

// TYPES
import type { ThemeColorKeys, ThemeFontKeys } from './types/theme';

// CONFIGS
import { themeColorsReadOnly, themeFontsReadOnly } from './config/theme-config';

/**
 *
 * @returns React.FC
 * This function is the controller of theme color and font of Resume Builder Application.
 * This React component supplies application with a small navbar containing color pallet and font options.
 */
export const ThemeChangingNavbar: React.FC = () => {
  const { color, changeThemeColor, font, changeThemeFont } = useResumeTheme();

  return (
    <div className={'flex flex-col gap-3'}>
      {/* Font Selection */}
      <div className={'flex flex-wrap gap-2'}>
        {Object.entries(themeFontsReadOnly).map(([fontKey, fontName]) => (
          <button
            key={`${fontKey}_${fontName}`}
            className={`flex-none whitespace-nowrap px-2 py-1 text-xs rounded-md cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md ${
              font === fontName
                ? 'bg-blue-500 text-white border-2 border-blue-600'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => changeThemeFont(fontKey as ThemeFontKeys)}
          >
            {fontName}
          </button>
        ))}
      </div>

      {/* Color Selection */}
      <div className={'flex gap-2'}>
        {Object.entries(themeColorsReadOnly).map(([colorName, colorCode]) => (
          <div
            key={`${colorName}_${colorCode}`}
            className={`w-5 h-5 rounded-full cursor-pointer transition-shadow duration-300 ease-in-out hover:shadow-lg transition-colors duration-300 ease-in-out ${color === colorCode ? 'border-2 border-blue-500 shadow-md' : 'border border-gray-300'}`}
            style={{ backgroundColor: colorCode }}
            onClick={() => changeThemeColor(colorName as ThemeColorKeys)}
          />
        ))}
      </div>
    </div>
  );
};
