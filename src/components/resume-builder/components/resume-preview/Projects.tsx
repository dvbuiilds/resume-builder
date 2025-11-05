import React from 'react';

// COMPONENTS
import { HorizontalRule } from './HorizontalRule';

// TYPES
import type { Project } from '../../types/resume-data';

// HOOKS
import { useResumeData } from '../../context/ResumeDataContext';
import { useResumeTheme } from '../../context/ResumeThemeContext';

export const Projects: React.FC = () => {
  const { projects } = useResumeData();
  const { color } = useResumeTheme();

  return (
    <div className="my-1">
      <h2 className="font-bold text-sm" style={{ color }}>
        {projects.title}
      </h2>
      <HorizontalRule color={color} />
      {projects.projects.map((project, index) => (
        <Project key={`projects_${index}`} index={index} data={project} />
      ))}
    </div>
  );
};

const Project: React.FC<{ index: number; data: Project }> = ({
  index,
  data,
}) => {
  return (
    <div className="mb-1">
      <div className="flex justify-between">
        <div className="font-bold text-xs">
          {data.organizationName} - {data.projectTitle}
        </div>
        <div className="font-bold text-xs">
          {data.startDate} — {data.endDate}
        </div>
      </div>
      <ul className="list-disc pl-5 mt-1 text-xs">
        {data.description.map((desc, descInd) => (
          <li key={`project_${index}_description_${descInd}`}>{desc}</li>
        ))}
      </ul>
    </div>
  );
};
