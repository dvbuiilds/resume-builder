import React, { ChangeEvent } from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// COMPONENTS
import {
  BlueButton,
  ButtonWithCrossIcon,
  InputField,
} from './EditPanelComponents';

// TYPES
import type { AchievementItem } from '../../types/resume-data';

export const AchievementsEditBox: React.FC = () => {
  const achievements = useResumeStore((s) => s.achievements);
  const setAchievementsTitle = useResumeStore((s) => s.setAchievementsTitle);
  const addAchievement = useResumeStore((s) => s.addAchievement);
  const updateAchievement = useResumeStore((s) => s.updateAchievement);
  const removeAchievement = useResumeStore((s) => s.removeAchievement);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAchievementsTitle(event.target.value);
  };

  const handleAchievementChange = (
    index: number,
    field: keyof AchievementItem,
    value: string,
  ) => {
    updateAchievement(index, { [field]: value } as any);
  };

  const addNewAchievement = () => {
    addAchievement();
  };

  const deleteAchievement = (index: number) => {
    if (achievements.achievementList.length === 1) {
      alert('At least one achievement item is required.');
      return;
    }
    removeAchievement(index);
  };

  return (
    <div className="space-y-4">
      <InputField
        type="text"
        value={achievements.title}
        onChange={handleTitleChange}
        placeholder="Achievements Section Title"
      />

      {achievements.achievementList.map((achievement, index) => (
        <AchievementEditBox
          key={`achievementEditBox_${index}`}
          index={index}
          data={achievement}
          handleAchievementChange={handleAchievementChange}
          deleteAchievement={deleteAchievement}
        />
      ))}

      <BlueButton label="Add New Achievement" onClick={addNewAchievement} />
    </div>
  );
};

interface AchievementEditBoxProps {
  index: number;
  data: AchievementItem;
  handleAchievementChange: (
    index: number,
    field: keyof AchievementItem,
    value: string,
  ) => void;
  deleteAchievement: (index: number) => void;
}

const AchievementEditBox: React.FC<AchievementEditBoxProps> = ({
  index,
  data,
  handleAchievementChange,
  deleteAchievement,
}) => {
  return (
    <div className="p-1 border rounded relative flex flex-col gap-1">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-medium">{`Achievement #${index + 1}`}</p>
        <ButtonWithCrossIcon onClick={() => deleteAchievement(index)} />
      </div>
      <InputField
        value={data.awardName}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleAchievementChange(index, 'awardName', event.target.value)
        }
        placeholder="Award Name"
      />
      <InputField
        value={data.institutionName}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleAchievementChange(index, 'institutionName', event.target.value)
        }
        placeholder="Institution Name"
      />
      <InputField
        value={data.dateAwarded}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleAchievementChange(index, 'dateAwarded', event.target.value)
        }
        placeholder="Date Awarded"
      />
      <InputField
        value={data.description}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
          handleAchievementChange(index, 'description', event.target.value)
        }
        placeholder="Description"
        isDescriptionField
      />
    </div>
  );
};
