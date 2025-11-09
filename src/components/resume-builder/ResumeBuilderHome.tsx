'use client';
import React, { useMemo } from 'react';
import { MdOutlineEditNote, MdOutlineHistory } from 'react-icons/md';

// PROVIDERS
import { LayoutProvider, useLayout } from './context/LayoutContext';
import { HistoryProvider } from './context/HistoryContext';

// COMPONENTS
import { ResumeThemeProvider } from './context/ResumeThemeContext';
import { Resume } from './components/resume-preview/Resume';
import { DownloadButton } from './DownloadButton';
import { EditPanel } from './components/edit-panel/EditPanel';
import { HistoryPanel } from './components/history/HistoryPanel';

// This Component is an HOC for ResumeBuilder so that the later can access LayoutContext.
export const ResumeBuilderHome = () => {
  return (
    <ResumeThemeProvider>
      <LayoutProvider>
        <HistoryProvider>
          <ResumeBuilder />
        </HistoryProvider>
      </LayoutProvider>
    </ResumeThemeProvider>
  );
};

const SidePanelButton: React.FC<{
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ isActive, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full flex-col items-center gap-2 rounded-lg px-3 py-4 text-xs font-medium transition ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full text-xl">
      {icon}
    </span>
    <span className="text-center">{label}</span>
  </button>
);

export const ResumeBuilder: React.FC = () => {
  const { displayMode, showEditPanel, showHistoryPanel, collapsePanel } =
    useLayout();

  const panelWidthClassName = useMemo(() => {
    switch (displayMode) {
      case 'edit':
      case 'history':
        return 'w-[520px]';
      default:
        return 'w-[80px]';
    }
  }, [displayMode]);

  const isEditOpen = displayMode === 'edit';
  const isHistoryOpen = displayMode === 'history';

  const handleEditPanelClick = () => {
    if (isEditOpen) {
      collapsePanel();
    } else {
      showEditPanel();
    }
  };

  const handleHistoryClick = () => {
    if (isHistoryOpen) {
      collapsePanel();
    } else {
      showHistoryPanel();
    }
  };

  return (
    <>
      <div className="flex flex-row w-full h-screen px-1">
        {/* Left Column - Side Panel with Controls */}
        <aside
          className={`${panelWidthClassName} transition-all duration-300 ease-in-out flex flex-row bg-white border-r border-gray-200 shadow-sm`}
        >
          <div className="flex w-[110px] flex-col gap-3 py-6">
            <SidePanelButton
              isActive={isEditOpen}
              icon={<MdOutlineEditNote />}
              label="Edit"
              onClick={handleEditPanelClick}
            />
            <SidePanelButton
              isActive={isHistoryOpen}
              icon={<MdOutlineHistory />}
              label="History"
              onClick={handleHistoryClick}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="h-full w-full">
              {isEditOpen ? <EditPanel /> : null}
              {isHistoryOpen ? <HistoryPanel /> : null}
            </div>
          </div>
        </aside>

        {/* Right Column - Resume Preview */}
        <div className="flex-1 min-h-screen overflow-auto scrollbar-hide py-2 px-4 flex items-start justify-center transition-all duration-300 bg-gray-200">
          <Resume />
        </div>
      </div>
      <DownloadButton />
    </>
  );
};
