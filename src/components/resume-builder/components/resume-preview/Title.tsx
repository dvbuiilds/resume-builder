import React from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';
import { useResumeTheme } from '../../context/ResumeThemeContext';

export const Title: React.FC = () => {
  const title = useResumeStore((s) => s.title);
  const { color } = useResumeTheme();
  return (
    <div className="w-full">
      <p className="text-center font-bold text-lg uppercase" style={{ color }}>
        {title}
      </p>
    </div>
  );
};
