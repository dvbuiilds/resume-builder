'use client';
import React, { useCallback, useMemo } from 'react';

// PROVIDERS
import { ResumeDataProvider } from './context/ResumeDataContext';
import { LayoutProvider, useLayout } from './context/LayoutContext';

// COMPONENTS
import { ResumeThemeProvider } from './context/ResumeThemeContext';
import { Resume } from './components/resume-preview/Resume';
import { ThemeChangingNavbar } from './ThemeChangingNavbar';
import { DownloadButton } from './DownloadButton';
import { EditPanel } from './components/edit-panel/EditPanel';
import { SectionSelectionCards } from './SectionSelectionCards';

// This Component is an HOC for ResumeBuilder so that the later can access LayoutContext.
export const ResumeBuilderHome = () => {
  return (
    <ResumeThemeProvider>
      <LayoutProvider>
        <ResumeBuilder />
      </LayoutProvider>
    </ResumeThemeProvider>
  );
};

export const ResumeBuilder: React.FC = () => {
  const { displayMode } = useLayout();

  // We are memoizing this class as the value of resumeWidthClassName is dependent on 2 values of 'displayMode'. So that final className value can be calculated and cached against the corresponding value of displayMode. No need to re-calculating the className value again and again. And at the same time, we can't conditionally change the className string like `w-${displayMode === 'preview' ? '3/4' : '2/3}` on runtime.
  const resumeWidthClassName = useMemo<string>(
    () => (displayMode === 'preview' ? 'w-3/4' : 'w-2/3'),
    [displayMode],
  );

  // We are memoizing the function that needs re-calculation upon change of displayMode.
  const renderEditPanel = useCallback(() => {
    return displayMode === 'edit' ? <EditPanel /> : null;
  }, [displayMode]);

  return (
    <>
      <SectionSelectionCards />
      <ThemeChangingNavbar />
      <ResumeDataProvider>
        <div className="flex flex-row w-full items-start justify-center gap-2 px-2 h-full">
          <div className={`flex flex-col ${resumeWidthClassName} items-center`}>
            <Resume />
          </div>
          {renderEditPanel()}
        </div>
        <DownloadButton />
      </ResumeDataProvider>
    </>
  );
};
