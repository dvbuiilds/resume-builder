import React from 'react';

// COMPONENTS
import { HorizontalRule } from './HorizontalRule';

// HOOKS
import { useResumeData } from '../../context/ResumeDataContext';
import { useResumeTheme } from '../../context/ResumeThemeContext';

// TYPES
import type { Course } from '../../types/resume-data';

export const Education: React.FC = () => {
  const { education } = useResumeData();
  const { color } = useResumeTheme();

  return (
    <div className="my-1">
      <h2 className="font-bold text-sm" style={{ color }}>
        {education.title}
      </h2>
      <HorizontalRule color={color} />
      {education.courses.map((course, index) => (
        <Course key={`educationCourse_${index}`} index={index} data={course} />
      ))}
    </div>
  );
};

const Course: React.FC<{ index: number; data: Course }> = ({ index, data }) => {
  return (
    <div className="mb-1">
      {/* Row for institution name and dates */}
      <div className="flex justify-between mt-1">
        <div className="text-xs font-bold">{data.institutionName}</div>
        <div className="text-xs font-bold">
          {data.startDate} — {data.endDate}
        </div>
      </div>
      {/* Row for courseName and scoreEarned */}
      <div className="flex justify-between">
        <div className="text-xs font-bold">{data.courseName}</div>
        <div className="text-xs">{data.scoreEarned}</div>
      </div>
      {/* Description list */}
      <ul className="list-disc pl-5 mt-1 text-xs">
        <li>{data.description}</li>
      </ul>
    </div>
  );
};
