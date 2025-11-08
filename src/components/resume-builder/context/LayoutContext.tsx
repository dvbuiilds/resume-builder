import React, { createContext, useState, useContext } from 'react';
import type { ActiveSectionName, DisplayMode } from '../types/layout';
import { SectionNameMapping } from '../config/section-name-config';

interface LayoutContextType {
  displayMode: DisplayMode;
  activeSection: ActiveSectionName;
  closeEditPanel: () => void;
  openEditPanel: () => void;
  toggleDisplayMode: (_: ActiveSectionName) => void;
  updateActiveSection: React.Dispatch<React.SetStateAction<ActiveSectionName>>;
  sectionsOrder: Array<ActiveSectionName>;
  updateSectionsOrder: React.Dispatch<
    React.SetStateAction<Array<ActiveSectionName>>
  >;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const initialSectionsOrder: ActiveSectionName[] = [
  SectionNameMapping.TITLE,
  SectionNameMapping.SOCIAL_HANDLES,
  SectionNameMapping.WORK_EXPERIENCE,
  SectionNameMapping.PROJECTS,
  SectionNameMapping.EDUCATION,
  SectionNameMapping.ACTIVITIES,
  SectionNameMapping.SKILLS,
  SectionNameMapping.ACHIEVEMENTS,
];

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [displayMode, updateDisplayMode] = useState<DisplayMode>('visible');
  const [activeSection, updateActiveSection] = useState<ActiveSectionName>('');
  const [sectionsOrder, updateSectionsOrder] =
    useState<Array<ActiveSectionName>>(initialSectionsOrder);

  const closeEditPanel = () => {
    updateDisplayMode('collapsed');
  };

  const openEditPanel = () => {
    updateDisplayMode('visible');
  };

  const toggleDisplayMode = (sectionName: ActiveSectionName) => {
    if (sectionName === activeSection) {
      updateActiveSection('');
    } else {
      updateActiveSection(sectionName);
    }
  };

  return (
    <LayoutContext.Provider
      value={{
        displayMode,
        activeSection,
        closeEditPanel,
        openEditPanel,
        toggleDisplayMode,
        updateActiveSection,
        sectionsOrder,
        updateSectionsOrder,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
