import React from 'react';

// COMPONENTS
import { HorizontalRule } from './HorizontalRule';

// TYPES
import type { AchievementItem } from '../../types/resume-data';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';
import { useResumeTheme } from '../../context/ResumeThemeContext';

export const Achievements: React.FC = () => {
  const achievements = useResumeStore((s) => s.achievements);
  const { color } = useResumeTheme();

  return (
    <div className="my-1">
      <h2 className="font-bold text-sm" style={{ color }}>
        {achievements.title}
      </h2>
      <HorizontalRule color={color} />
      {achievements.achievementList.map((achievement, index) => (
        <AchievementItem key={`achievement_${index}`} data={achievement} />
      ))}
    </div>
  );
};

interface AchievementItemProps {
  data: AchievementItem;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ data }) => {
  return (
    <div className="mb-1">
      <div className="flex justify-between">
        <div className="font-bold text-xs">
          {data.awardName} - {data.institutionName}
        </div>
        <div className="text-xs font-bold">{data.dateAwarded}</div>
      </div>
      <p className="text-xs">{data.description}</p>
    </div>
  );
};
