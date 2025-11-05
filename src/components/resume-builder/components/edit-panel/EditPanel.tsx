import React from 'react';

// HOOKS
import { useLayout } from '../../context/LayoutContext';

// COMPONENTS
import { AccordionContainer } from '../wrappers/AccordionContainer';
import { ButtonWithCrossIcon } from './EditPanelComponents';
import { SocialHandlesEditBox } from './SocialHandlesEditBox';
import { TitleEditBox } from './TitleEditBox';
import { WorkExperienceEditBox } from './WorkExperienceEditBox';
import { SectionSelectionCards } from '../../SectionSelectionCards';
import { ThemeChangingNavbar } from '../../ThemeChangingNavbar';

// TYPES
import { ActiveSectionName } from '../../types/layout';
import { ProjectsEditBox } from './ProjectsEditBox';
import { EducationEditBox } from './EducationEditBox';
import { ActivitiesEditBox } from './ActivitiesEditBox';
import { SkillsEditBox } from './SkillsEditBox';
import { AchievementsEditBox } from './AchievementsEditBox';

// CONFIGS
import {
  SectionNameMapping,
  SectionIdTitleMapping,
} from '../../config/section-name-config';

const renderSection = (sectionName: ActiveSectionName) => {
  switch (sectionName) {
    case SectionNameMapping.TITLE: {
      return <TitleEditBox />;
    }
    case SectionNameMapping.SOCIAL_HANDLES: {
      return <SocialHandlesEditBox />;
    }
    case SectionNameMapping.WORK_EXPERIENCE: {
      return <WorkExperienceEditBox />;
    }
    case SectionNameMapping.PROJECTS: {
      return <ProjectsEditBox />;
    }
    case SectionNameMapping.EDUCATION: {
      return <EducationEditBox />;
    }
    case SectionNameMapping.ACTIVITIES: {
      return <ActivitiesEditBox />;
    }
    case SectionNameMapping.SKILLS: {
      return <SkillsEditBox />;
    }
    case SectionNameMapping.ACHIEVEMENTS: {
      return <AchievementsEditBox />;
    }
    default: {
      return;
    }
  }
};

export const EditPanel: React.FC = () => {
  const { activeSection, sectionsOrder, closeEditPanel, updateActiveSection } =
    useLayout();

  const onTabClick = (sectionName: ActiveSectionName) => {
    if (activeSection === sectionName) {
      updateActiveSection('');
    } else {
      updateActiveSection(sectionName);
    }
  };

  const renderEditSections = () =>
    sectionsOrder.map((sectionName) => {
      return (
        <AccordionContainer
          key={`${sectionName}_editBox`}
          title={SectionIdTitleMapping[sectionName]}
          isOpen={activeSection === sectionName}
          onToggle={() => onTabClick(sectionName)}
        >
          {renderSection(sectionName)}
        </AccordionContainer>
      );
    });

  return (
    <div className="w-full h-screen relative px-3 py-2 border border-gray-200 rounded-md bg-white overflow-y-auto">
      <div className="flex flex-row items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-2">
        <p className="font-medium">Edit Panel</p>
        <ButtonWithCrossIcon onClick={closeEditPanel} />
      </div>

      {/* Section Selection Cards */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Sections</h3>
        <SectionSelectionCards />
      </div>

      {/* Theme Options */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Theme</h3>
        <ThemeChangingNavbar />
      </div>

      {/* Edit Sections */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-gray-700">Content</h3>
        {renderEditSections()}
      </div>
    </div>
  );
};
