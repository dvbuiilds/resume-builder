import React from 'react';
import { Document, Page } from '@react-pdf/renderer';
import type { ActiveSectionName } from '../../types/layout';
import type {
  Achievements,
  Activities,
  Education,
  Projects,
  Skills,
  SocialHandle,
  WorkExperience,
} from '../../types/resume-data';
import type { ThemeColorValues, ThemeFontValues } from '../../types/theme';
import { usePDFStyles } from '../../utils/pdfTheme';
import { SectionNameMapping } from '../../config/section-name-config';
import { calculateContentMetrics } from '../../utils/calculateContentDensity';
import { calculateFontScaleFactor } from '../../utils/calculateFontScale';

// Import to register fonts
import '../../utils/pdfFonts';

// Import PDF components
import { PDFTitle } from './PDFTitle';
import { PDFSocialHandles } from './PDFSocialHandles';
import { PDFWorkExperience } from './PDFWorkExperience';
import { PDFProjects } from './PDFProjects';
import { PDFEducation } from './PDFEducation';
import { PDFActivities } from './PDFActivities';
import { PDFSkills } from './PDFSkills';
import { PDFAchievements } from './PDFAchievements';

interface PDFResumeProps {
  title: string;
  socialHandles: Array<SocialHandle>;
  workExperience: WorkExperience;
  projects: Projects;
  education: Education;
  activities: Activities;
  skills: Skills;
  achievements: Achievements;
  sectionsOrder: ActiveSectionName[];
  color: ThemeColorValues;
  font: ThemeFontValues;
}

export const PDFResume: React.FC<PDFResumeProps> = ({
  title,
  socialHandles,
  workExperience,
  projects,
  education,
  activities,
  skills,
  achievements,
  sectionsOrder,
  color,
  font,
}) => {
  // Calculate content metrics and determine scale factor for adaptive font sizing
  const contentMetrics = calculateContentMetrics({
    title,
    socialHandles,
    workExperience,
    projects,
    education,
    activities,
    skills,
    achievements,
    sectionsOrder,
  });
  const scaleFactor = calculateFontScaleFactor(contentMetrics.estimatedHeight);

  const styles = usePDFStyles(color, font, scaleFactor);

  const renderPDFSection = (sectionName: ActiveSectionName) => {
    switch (sectionName) {
      case SectionNameMapping.TITLE:
        return <PDFTitle key="title" title={title} styles={styles} />;

      case SectionNameMapping.SOCIAL_HANDLES:
        return (
          <PDFSocialHandles
            key="socialHandles"
            socialHandles={socialHandles}
            styles={styles}
          />
        );

      case SectionNameMapping.WORK_EXPERIENCE:
        return (
          <PDFWorkExperience
            key="workExperience"
            workExperience={workExperience}
            styles={styles}
          />
        );

      case SectionNameMapping.PROJECTS:
        return (
          <PDFProjects key="projects" projects={projects} styles={styles} />
        );

      case SectionNameMapping.EDUCATION:
        return (
          <PDFEducation key="education" education={education} styles={styles} />
        );

      case SectionNameMapping.ACTIVITIES:
        return (
          <PDFActivities
            key="activities"
            activities={activities}
            styles={styles}
          />
        );

      case SectionNameMapping.SKILLS:
        return <PDFSkills key="skills" skills={skills} styles={styles} />;

      case SectionNameMapping.ACHIEVEMENTS:
        return (
          <PDFAchievements
            key="achievements"
            achievements={achievements}
            styles={styles}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {sectionsOrder.map((sectionName) => renderPDFSection(sectionName))}
      </Page>
    </Document>
  );
};
