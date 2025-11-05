import React from 'react';

// COMPONENTS
import { HorizontalRule } from './HorizontalRule';

// TYPES
import type { ActivityItem } from '../../types/resume-data';

// HOOKS
import { useResumeData } from '../../context/ResumeDataContext';
import { useResumeTheme } from '../../context/ResumeThemeContext';

export const Activities = () => {
  const { activities } = useResumeData();
  const { color } = useResumeTheme();

  return (
    <div className="my-1">
      <h2 className="font-bold text-sm" style={{ color }}>
        {activities.title}
      </h2>
      <HorizontalRule color={color} />
      {activities.activities.map((activity, index) => (
        <ActivityItem key={`activity_${index}`} index={index} data={activity} />
      ))}
    </div>
  );
};

const ActivityItem: React.FC<{ index: number; data: ActivityItem }> = ({
  index,
  data,
}) => (
  <div className="mb-1">
    <div className="flex justify-between">
      <div className="font-bold text-xs">
        {data.institutionName} - {data.activityTitle}
      </div>
      <div className="font-bold text-xs">
        {data.startDate} — {data.endDate}
      </div>
    </div>
    <ul className="list-disc pl-5 mt-1 text-xs">
      {data.descriptions.map((desc, descIndex) => (
        <li key={`activity_${index}_description_${descIndex}`}>{desc}</li>
      ))}
    </ul>
  </div>
);
