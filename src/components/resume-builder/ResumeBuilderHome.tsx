'use client';
import React, { useMemo } from 'react';

// PROVIDERS
import { ResumeDataProvider } from './context/ResumeDataContext';
import { LayoutProvider, useLayout } from './context/LayoutContext';

// COMPONENTS
import { ResumeThemeProvider } from './context/ResumeThemeContext';
import { Resume } from './components/resume-preview/Resume';
import { DownloadButton } from './DownloadButton';
import { EditPanel } from './components/edit-panel/EditPanel';
import { EditPanelToggleButton } from './components/edit-panel/EditPanelToggleButton';

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

  // Calculate panel width based on edit panel visibility (fixed 500px)
  const editPanelWidthClassName = useMemo<string>(
    () => (displayMode === 'visible' ? 'w-[500px]' : 'w-0'),
    [displayMode],
  );

  return (
    <>
      <ResumeDataProvider>
        <div className="flex flex-row w-full h-screen px-1">
          {/* Left Column - Edit Panel (fixed width) */}
          <div
            className={`${editPanelWidthClassName} transition-all duration-300 overflow-hidden`}
          >
            {displayMode === 'visible' ? <EditPanel /> : null}
          </div>

          {/* Toggle Button - Show when panel is collapsed (left edge) */}
          {displayMode === 'collapsed' ? <EditPanelToggleButton /> : null}

          {/* Right Column - Resume Preview */}
          <div className="flex-1 min-h-screen overflow-auto py-2 px-4 flex items-start justify-center transition-all duration-300 bg-[#F2F2F2]">
            <Resume />
          </div>
        </div>
        <DownloadButton />
      </ResumeDataProvider>
    </>
  );
};
