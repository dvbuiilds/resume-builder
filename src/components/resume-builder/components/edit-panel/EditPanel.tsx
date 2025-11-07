import React from 'react';
import {
  MdOutlineTitle,
  MdOutlineWorkOutline,
  MdOutlineLink,
  MdOutlineSchool,
  MdOutlineFolderSpecial,
  MdOutlineEmojiEvents,
  MdOutlineDirectionsRun,
  MdOutlineExtension,
} from 'react-icons/md';

// HOOKS
import { useLayout } from '../../context/LayoutContext';

// COMPONENTS
import { AccordionContainer } from '../wrappers/AccordionContainer';
import { ButtonWithCrossIcon } from './EditPanelComponents';
import { SocialHandlesEditBox } from './SocialHandlesEditBox';
import { TitleEditBox } from './TitleEditBox';
import { WorkExperienceEditBox } from './WorkExperienceEditBox';
import { SectionSelectionCards } from '../../SectionSelectionCards';
import { ThemeChangingNavbar } from './ThemeChangingNavbar';

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

const getSectionIcon = (sectionName: ActiveSectionName) => {
  switch (sectionName) {
    case SectionNameMapping.TITLE:
      return <MdOutlineTitle />;
    case SectionNameMapping.WORK_EXPERIENCE:
      return <MdOutlineWorkOutline />;
    case SectionNameMapping.SOCIAL_HANDLES:
      return <MdOutlineLink />;
    case SectionNameMapping.EDUCATION:
      return <MdOutlineSchool />;
    case SectionNameMapping.PROJECTS:
      return <MdOutlineFolderSpecial />;
    case SectionNameMapping.ACHIEVEMENTS:
      return <MdOutlineEmojiEvents />;
    case SectionNameMapping.ACTIVITIES:
      return <MdOutlineDirectionsRun />;
    case SectionNameMapping.SKILLS:
      return <MdOutlineExtension />;
    default:
      return null;
  }
};

const renderSection = (
  sectionName: ActiveSectionName,
  isOpen: boolean,
  onToggle: () => void,
) => {
  const icon = getSectionIcon(sectionName);
  const title = SectionIdTitleMapping[sectionName];

  let content: React.ReactNode;
  switch (sectionName) {
    case SectionNameMapping.TITLE: {
      content = <TitleEditBox />;
      break;
    }
    case SectionNameMapping.SOCIAL_HANDLES: {
      content = <SocialHandlesEditBox />;
      break;
    }
    case SectionNameMapping.WORK_EXPERIENCE: {
      content = <WorkExperienceEditBox />;
      break;
    }
    case SectionNameMapping.PROJECTS: {
      content = <ProjectsEditBox />;
      break;
    }
    case SectionNameMapping.EDUCATION: {
      content = <EducationEditBox />;
      break;
    }
    case SectionNameMapping.ACTIVITIES: {
      content = <ActivitiesEditBox />;
      break;
    }
    case SectionNameMapping.SKILLS: {
      content = <SkillsEditBox />;
      break;
    }
    case SectionNameMapping.ACHIEVEMENTS: {
      content = <AchievementsEditBox />;
      break;
    }
    default: {
      return null;
    }
  }

  return (
    <AccordionContainer
      key={`${sectionName}_editBox`}
      title={title}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {content}
    </AccordionContainer>
  );
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

  return (
    <div className="w-full h-screen relative px-3 py-2 border border-gray-200 rounded-md bg-white overflow-y-auto scrollbar-hide">
      <div className="flex flex-row items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-2 shadow-sm">
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
        {sectionsOrder.map((sectionName) =>
          renderSection(sectionName, activeSection === sectionName, () =>
            onTabClick(sectionName),
          ),
        )}
      </div>
    </div>
  );
};
