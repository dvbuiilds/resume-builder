import { pdf } from '@react-pdf/renderer';
import { PDFResume } from '../components/pdf-export/PDFResume';
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
import type { ThemeColorValues, ThemeFontValues } from '../types/theme';

// Import to register fonts
import './pdfFonts';

interface ExportResumeData {
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

/**
 * Export resume to PDF
 * @param data - Resume data including content, theme, and layout
 * @param filename - Optional filename (defaults to "Resume_[Name].pdf")
 */
export const exportResumeToPdf = async (
  data: ExportResumeData,
  filename?: string,
): Promise<void> => {
  let url: string | null = null;
  let link: HTMLAnchorElement | null = null;

  try {
    // Generate filename if not provided
    const pdfFilename =
      filename ||
      `Resume_${data.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Untitled'}.pdf`;

    // Create PDF blob
    const blob = await pdf(
      <PDFResume
        title={data.title}
        socialHandles={data.socialHandles}
        workExperience={data.workExperience}
        projects={data.projects}
        education={data.education}
        activities={data.activities}
        skills={data.skills}
        achievements={data.achievements}
        sectionsOrder={data.sectionsOrder}
        color={data.color}
        font={data.font}
      />,
    ).toBlob();

    // Create download link
    url = URL.createObjectURL(blob);
    link = document.createElement('a');
    link.href = url;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  } finally {
    // Ensure cleanup happens even if there's an error
    if (link && document.body.contains(link)) {
      document.body.removeChild(link);
    }
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
};
