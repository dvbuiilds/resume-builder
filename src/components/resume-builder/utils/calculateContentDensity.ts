import type { ActiveSectionName } from '../types/layout';
import type {
  Achievements,
  Activities,
  Education,
  Projects,
  Skills,
  SocialHandle,
  WorkExperience,
} from '../types/resume-data';

/**
 * Constants for height estimation
 */
const AVG_CHARS_PER_LINE = 70; // Average characters per line for A4 width with 30pt horizontal padding
const LINE_HEIGHT = 1.4;
const BASE_FONT_SIZE = 12;
const SECTION_SPACING = 20; // Margin between sections
const ITEM_SPACING = 10; // Margin between items

/**
 * Resume data structure for content calculation
 */
export interface ResumeDataForCalculation {
  title: string;
  socialHandles: Array<SocialHandle>;
  workExperience: WorkExperience;
  projects: Projects;
  education: Education;
  activities: Activities;
  skills: Skills;
  achievements: Achievements;
  sectionsOrder: ActiveSectionName[];
}

/**
 * Content metrics returned from calculation
 */
export interface ContentMetrics {
  estimatedHeight: number;
  lineCount: number;
  itemCount: number;
}

/**
 * Calculate the number of active sections (non-empty sections in order)
 */
const countActiveSections = (data: ResumeDataForCalculation): number => {
  let count = 0;

  // Title is always present
  if (data.title && data.sectionsOrder.includes('title')) {
    count++;
  }

  // Social handles
  if (
    data.socialHandles.length > 0 &&
    data.sectionsOrder.includes('socialHandles')
  ) {
    count++;
  }

  // Work experience
  if (
    data.workExperience.experience?.length > 0 &&
    data.sectionsOrder.includes('workExperience')
  ) {
    count++;
  }

  // Projects
  if (
    data.projects.projects?.length > 0 &&
    data.sectionsOrder.includes('projects')
  ) {
    count++;
  }

  // Education
  if (
    data.education.courses?.length > 0 &&
    data.sectionsOrder.includes('education')
  ) {
    count++;
  }

  // Activities
  if (
    data.activities.activities?.length > 0 &&
    data.sectionsOrder.includes('activities')
  ) {
    count++;
  }

  // Skills
  if (
    data.skills.skillSet?.length > 0 &&
    data.sectionsOrder.includes('skills')
  ) {
    count++;
  }

  // Achievements
  if (
    data.achievements.achievementList?.length > 0 &&
    data.sectionsOrder.includes('achievements')
  ) {
    count++;
  }

  return count;
};

/**
 * Calculate estimated vertical height required for resume content
 * @param data - Resume data including all sections
 * @returns Content metrics with estimated height, line count, and item count
 */
export const calculateContentMetrics = (
  data: ResumeDataForCalculation,
): ContentMetrics => {
  let estimatedHeight = 0;
  let totalLines = 0;
  let totalItems = 0;

  // Title section
  if (data.title && data.sectionsOrder.includes('title')) {
    estimatedHeight += 30; // Title font size (18) + margin
    totalLines += 2;
  }

  // Social handles section
  if (
    data.socialHandles.length > 0 &&
    data.sectionsOrder.includes('socialHandles')
  ) {
    estimatedHeight += 25; // Approximate height for social handles row
    totalLines += 1;
  }

  // Work experience section
  if (
    data.workExperience.experience?.length > 0 &&
    data.sectionsOrder.includes('workExperience')
  ) {
    estimatedHeight += 20; // Heading + horizontal rule
    data.workExperience.experience.forEach((exp) => {
      estimatedHeight += 35; // Job title, company name, date (3 lines)
      totalItems++;
      // Calculate description lines
      exp.description?.forEach((desc) => {
        const lines = Math.ceil(desc.length / AVG_CHARS_PER_LINE);
        estimatedHeight += lines * BASE_FONT_SIZE * LINE_HEIGHT;
        totalLines += lines;
      });
      estimatedHeight += ITEM_SPACING;
    });
  }

  // Projects section
  if (
    data.projects.projects?.length > 0 &&
    data.sectionsOrder.includes('projects')
  ) {
    estimatedHeight += 20; // Heading + horizontal rule
    data.projects.projects.forEach((project) => {
      estimatedHeight += 35; // Project title, organization, date (3 lines)
      totalItems++;
      // Calculate description lines
      project.description?.forEach((desc) => {
        const lines = Math.ceil(desc.length / AVG_CHARS_PER_LINE);
        estimatedHeight += lines * BASE_FONT_SIZE * LINE_HEIGHT;
        totalLines += lines;
      });
      estimatedHeight += ITEM_SPACING;
    });
  }

  // Education section
  if (
    data.education.courses?.length > 0 &&
    data.sectionsOrder.includes('education')
  ) {
    estimatedHeight += 20; // Heading + horizontal rule
    data.education.courses.forEach((course) => {
      estimatedHeight += 50; // Course name, institution, date, score (4 lines)
      totalItems++;
      // Calculate description lines if present
      if (course.description) {
        const lines = Math.ceil(course.description.length / AVG_CHARS_PER_LINE);
        estimatedHeight += lines * BASE_FONT_SIZE * LINE_HEIGHT;
        totalLines += lines;
      }
      estimatedHeight += ITEM_SPACING;
    });
  }

  // Activities section
  if (
    data.activities.activities?.length > 0 &&
    data.sectionsOrder.includes('activities')
  ) {
    estimatedHeight += 20; // Heading + horizontal rule
    data.activities.activities.forEach((activity) => {
      estimatedHeight += 35; // Activity title, institution, date (3 lines)
      totalItems++;
      // Calculate description lines
      activity.descriptions?.forEach((desc) => {
        const lines = Math.ceil(desc.length / AVG_CHARS_PER_LINE);
        estimatedHeight += lines * BASE_FONT_SIZE * LINE_HEIGHT;
        totalLines += lines;
      });
      estimatedHeight += ITEM_SPACING;
    });
  }

  // Skills section
  if (
    data.skills.skillSet?.length > 0 &&
    data.sectionsOrder.includes('skills')
  ) {
    estimatedHeight += 20; // Heading + horizontal rule
    data.skills.skillSet.forEach((skillSet) => {
      estimatedHeight += 15; // Skill title + skill list (compact format)
      totalItems++;
      // Skills are displayed inline with bullet separators, so minimal height per skill set
      const skillsText = skillSet.skills.join(' • ');
      const lines = Math.ceil(skillsText.length / AVG_CHARS_PER_LINE);
      estimatedHeight += lines * BASE_FONT_SIZE * LINE_HEIGHT;
      totalLines += lines;
    });
    estimatedHeight += 8 * (data.skills.skillSet.length - 1); // Margin between skill sets
  }

  // Achievements section
  if (
    data.achievements.achievementList?.length > 0 &&
    data.sectionsOrder.includes('achievements')
  ) {
    estimatedHeight += 20; // Heading + horizontal rule
    data.achievements.achievementList.forEach((achievement) => {
      estimatedHeight += 45; // Award name, institution, date (3 lines)
      totalItems++;
      // Calculate description lines if present
      if (achievement.description) {
        const lines = Math.ceil(
          achievement.description.length / AVG_CHARS_PER_LINE,
        );
        estimatedHeight += lines * BASE_FONT_SIZE * LINE_HEIGHT;
        totalLines += lines;
      }
      estimatedHeight += ITEM_SPACING;
    });
  }

  // Add spacing between sections
  const sectionsWithContent = countActiveSections(data);
  if (sectionsWithContent > 1) {
    estimatedHeight += (sectionsWithContent - 1) * SECTION_SPACING;
  }

  return {
    estimatedHeight,
    lineCount: totalLines,
    itemCount: totalItems,
  };
};
