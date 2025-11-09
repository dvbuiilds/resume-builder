import React, { useCallback, useState } from 'react';
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

// COMPONENTS
import { AccordionContainer } from '../wrappers/AccordionContainer';
import { AchievementsEditBox } from './AchievementsEditBox';
import { ActiveSectionName } from '../../types/layout';
import { ActivitiesEditBox } from './ActivitiesEditBox';
import { EducationEditBox } from './EducationEditBox';
import { ProjectsEditBox } from './ProjectsEditBox';
import { SectionSelectionCards } from '../../SectionSelectionCards';
import { SkillsEditBox } from './SkillsEditBox';
import { SocialHandlesEditBox } from './SocialHandlesEditBox';
import { ThemeChangingNavbar } from './ThemeChangingNavbar';
import { TitleEditBox } from './TitleEditBox';
import { WorkExperienceEditBox } from './WorkExperienceEditBox';

// TYPES
import type { HistoryEntry } from '../../context/HistoryContext';

// HOOKS
import { useLayout } from '../../context/LayoutContext';
import { useHistory } from '../../context/HistoryContext';

// UTILS
import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';
import { getResumeSnapshotForSave } from '../../store/resumePersistence';
import { parseErrorMessage } from '../../utils/parseErrorMessage';

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
  const { entries, setEntries } = useHistory();
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveFeedback(null);

    try {
      const snapshot = getResumeSnapshotForSave();
      const existing = entries.find(
        (entry) => entry.resumeId === snapshot.resumeId,
      );

      const response = await fetchWithTimeout(
        '/api/past-resumes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            resumeId: snapshot.resumeId,
            data: snapshot.serialized,
            rowId: existing?.rowId,
          }),
        },
        2000,
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message || 'Failed to save resume.');
      }

      const payload = (await response.json()) as {
        data?: HistoryEntry[];
      };

      if (Array.isArray(payload?.data)) {
        setEntries(payload.data);
      }

      setSaveFeedback({
        type: 'success',
        text: 'Resume saved successfully.',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save resume.';
      setSaveFeedback({
        type: 'error',
        text: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [entries, isSaving, setEntries]);

  const onTabClick = (sectionName: ActiveSectionName) => {
    if (activeSection === sectionName) {
      updateActiveSection('');
    } else {
      updateActiveSection(sectionName);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-y-auto rounded-md border border-gray-200 bg-white px-3 pb-2 scrollbar-hide">
      <header className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-gray-200 bg-white py-2">
        <div className="flex items-center gap-2 text-gray-700">
          <p className="text-sm font-semibold uppercase tracking-wide">
            Edit Panel
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </header>

      {saveFeedback ? (
        <div
          className={`mb-4 rounded-md border px-3 py-2 text-xs ${
            saveFeedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {saveFeedback.text}
        </div>
      ) : null}

      {/* Section Selection Cards */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Sections</h3>
        <SectionSelectionCards />
      </div>

      {/* Theme Options */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Theme</h3>
        <ThemeChangingNavbar />
      </div>

      {/* Edit Sections */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Content</h3>
        {sectionsOrder.map((sectionName) =>
          renderSection(sectionName, activeSection === sectionName, () =>
            onTabClick(sectionName),
          ),
        )}
      </div>
    </div>
  );
};
