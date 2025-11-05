import React from 'react';

// TYPES
import type { Experience } from '../../types/resume-data';

// COMPONENTS
import { HorizontalRule } from './HorizontalRule';

// HOOKS
import { useResumeData } from '../../context/ResumeDataContext';
import { useResumeTheme } from '../../context/ResumeThemeContext';

export const WorkExperience: React.FC = () => {
  const { workExperience } = useResumeData();
  const { color } = useResumeTheme();

  return (
    <div className="my-1">
      <h2 className="font-bold text-sm" style={{ color }}>
        {workExperience.title}
      </h2>
      <HorizontalRule color={color} />
      {workExperience.experience.map((exp, index) => (
        <Experience key={`workExperience_${index}`} index={index} data={exp} />
      ))}
    </div>
  );
};

const Experience: React.FC<{ index: number; data: Experience }> = ({
  index,
  data,
}) => {
  return (
    <div className="mb-1">
      <div className="flex justify-between">
        <div className="font-bold text-xs">
          {data.companyName} - {data.jobTitle}
        </div>
        <div className="font-bold text-xs">
          {data.startDate} — {data.endDate}
        </div>
      </div>
      <ul className="list-disc pl-5 mt-1 text-xs">
        {data.description.map((desc, descInd) => (
          <li key={`experience_${index}_description_${descInd}`}>{desc}</li>
        ))}
      </ul>
    </div>
  );
};
