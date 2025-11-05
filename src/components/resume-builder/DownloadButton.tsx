import React, { useState } from 'react';
import { FaDownload, FaCheck, FaSpinner } from 'react-icons/fa';

// HOOKS
import { useResumeData } from './context/ResumeDataContext';
import { useResumeTheme } from './context/ResumeThemeContext';
import { useLayout } from './context/LayoutContext';

// UTILS
import { exportResumeToPdf } from './utils/exportToPdf';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export const DownloadButton: React.FC = () => {
  const [state, setState] = useState<ButtonState>('idle');

  // Get data from contexts
  const resumeData = useResumeData();
  const { color, font } = useResumeTheme();
  const { sectionsOrder } = useLayout();

  const handleDownload = async () => {
    try {
      setState('loading');

      await exportResumeToPdf({
        title: resumeData.title,
        socialHandles: resumeData.socialHandles,
        workExperience: resumeData.workExperience,
        projects: resumeData.projects,
        education: resumeData.education,
        activities: resumeData.activities,
        skills: resumeData.skills,
        achievements: resumeData.achievements,
        sectionsOrder,
        color,
        font,
      });

      setState('success');

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setState('idle');
      }, 2000);
    } catch (error) {
      console.error('PDF export failed:', error);
      setState('error');

      // Reset to idle after 3 seconds on error
      setTimeout(() => {
        setState('idle');
      }, 3000);
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <FaSpinner className="animate-spin" />
            <span>Generating...</span>
          </>
        );
      case 'success':
        return (
          <>
            <FaCheck />
            <span>Downloaded!</span>
          </>
        );
      case 'error':
        return (
          <>
            <FaDownload />
            <span>Retry</span>
          </>
        );
      default:
        return (
          <>
            <FaDownload />
            <span>Download PDF</span>
          </>
        );
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={state === 'loading'}
      className={`
        fixed bottom-8 right-8 
        flex items-center gap-2 
        px-6 py-3 
        bg-blue-600 hover:bg-blue-700 
        text-white 
        rounded-full 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        z-50
        ${state === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
        ${state === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
      `}
      title="Download Resume as PDF"
    >
      {getButtonContent()}
    </button>
  );
};
