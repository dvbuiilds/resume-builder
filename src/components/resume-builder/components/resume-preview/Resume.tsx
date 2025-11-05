import React from 'react';
import { Cormorant_Garamond, Inter } from 'next/font/google';

// THIRD_PARTY
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

// HOOKS
import { useLayout } from '../../context/LayoutContext';
import { useResumeTheme } from '../../context/ResumeThemeContext';
import { useResumeFontStyles } from '../../hooks/useResumeFontStyles';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

// COMPONENTS
import { Title } from './Title';
import { SocialHandles } from './SocialHandles';
import { EditableWrapper } from '../wrappers/EditableWrapper';
import { WorkExperience } from './WorkExperience';
import { Projects } from './Projects';
import { Education } from './Education';
import { Activities } from './Activities';
import { Skills } from './Skills';
import { Achievements } from './Achievements';

// TYPES
import { ActiveSectionName } from '../../types/layout';

// CONFIGS
import { SectionNameMapping } from '../../config/section-name-config';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({ subsets: ['latin'] });

const A4_SHEET_CONFIG = {
  width: '595px',
  height: '842px',
};

const renderSection = (sectionName: ActiveSectionName) => {
  switch (sectionName) {
    case SectionNameMapping.TITLE: {
      return <Title />;
    }
    case SectionNameMapping.SOCIAL_HANDLES: {
      return <SocialHandles />;
    }
    case SectionNameMapping.WORK_EXPERIENCE: {
      return <WorkExperience />;
    }
    case SectionNameMapping.PROJECTS: {
      return <Projects />;
    }
    case SectionNameMapping.EDUCATION: {
      return <Education />;
    }
    case SectionNameMapping.ACTIVITIES: {
      return <Activities />;
    }
    case SectionNameMapping.SKILLS: {
      return <Skills />;
    }
    case SectionNameMapping.ACHIEVEMENTS: {
      return <Achievements />;
    }
    default: {
      return null;
    }
  }
};

export const Resume = () => {
  const { sectionsOrder, updateSectionsOrder } = useLayout();
  const { font } = useResumeTheme();

  // Use custom hook for font styling
  const { className: fontClassName, style: fontStyle } = useResumeFontStyles({
    font,
    cormorantGaramondClassName: cormorantGaramond.className,
    interClassName: inter.className,
  });

  // Use custom hook for drag and drop functionality
  const { onDragEnd } = useDragAndDrop({
    sectionsOrder,
    updateSectionsOrder,
  });

  return (
    <div
      className={`${fontClassName} shadow-md w-3/4 bg-slate-50 mt-2 p-4 flex flex-col`}
      style={fontStyle}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sectionsOrder.map((sectionName, sectionIndex) => (
                <Draggable
                  key={`${sectionName}_${sectionIndex}`}
                  draggableId={`${sectionName}_${sectionIndex}`}
                  index={sectionIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <EditableWrapper
                        key={`${sectionName}_${sectionIndex}`}
                        id={sectionName}
                      >
                        {renderSection(sectionName)}
                      </EditableWrapper>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
