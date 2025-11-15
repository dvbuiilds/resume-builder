import React, { ChangeEvent } from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// COMPONENTS
import { ActivityItem } from '../../types/resume-data';
import {
  BlueButton,
  ButtonWithCrossIcon,
  ButtonWithPlusIcon,
  InputField,
} from './EditPanelComponents';
import { InputFieldV2 } from './InputFieldV2';

export const ActivitiesEditBox: React.FC = () => {
  const activities = useResumeStore((s) => s.activities);
  const setActivitiesTitle = useResumeStore((s) => s.setActivitiesTitle);
  const addActivity = useResumeStore((s) => s.addActivity);
  const updateActivity = useResumeStore((s) => s.updateActivity);
  const removeActivity = useResumeStore((s) => s.removeActivity);
  const addActivityDescription = useResumeStore(
    (s) => s.addActivityDescription,
  );
  const updateActivityDescription = useResumeStore(
    (s) => s.updateActivityDescription,
  );
  const removeActivityDescription = useResumeStore(
    (s) => s.removeActivityDescription,
  );

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActivitiesTitle(event.target.value);
  };

  const handleActivityChange = (
    index: number,
    field: keyof ActivityItem,
    value: string,
  ) => {
    updateActivity(index, { [field]: value } as any);
  };

  const handleDescriptionChange = (
    activityIndex: number,
    descIndex: number,
    value: string,
  ) => {
    updateActivityDescription(activityIndex, descIndex, value);
  };

  const addNewActivity = () => {
    addActivity();
  };

  const deleteActivity = (activityIndex: number) => {
    if (activities.activities.length === 1) {
      alert('Minimum 1 Activity is needed!');
      return;
    }
    removeActivity(activityIndex);
  };

  const addNewDescription = (activityIndex: number) => {
    addActivityDescription(activityIndex);
  };

  const deleteDescription = (activityIndex: number, descIndex: number) => {
    if (activities.activities[activityIndex].descriptions.length === 1) {
      alert('At least one description is needed for an activity.');
      return;
    }
    removeActivityDescription(activityIndex, descIndex);
  };

  return (
    <div className="space-y-4">
      <InputField
        type="text"
        value={activities.title}
        onChange={handleTitleChange}
        placeholder="Activities Section Title"
      />

      {activities.activities.map((activity, activityIndex) => (
        <ActivityEditBox
          key={`activityEditBox_${activityIndex}`}
          index={activityIndex}
          data={activity}
          addNewDescription={addNewDescription}
          deleteDescription={deleteDescription}
          deleteActivity={deleteActivity}
          handleDescriptionChange={handleDescriptionChange}
          handleActivityChange={handleActivityChange}
        />
      ))}

      <BlueButton label="Add New Activity" onClick={addNewActivity} />
    </div>
  );
};

interface ActivityEditBoxProps {
  index: number;
  data: ActivityItem;
  handleActivityChange: (
    index: number,
    keyName: keyof ActivityItem,
    value: string,
  ) => void;
  deleteActivity: (index: number) => void;
  handleDescriptionChange: (
    activityIndex: number,
    descIndex: number,
    value: string,
  ) => void;
  addNewDescription: (index: number) => void;
  deleteDescription: (activityIndex: number, descIndex: number) => void;
}

const ActivityEditBox: React.FC<ActivityEditBoxProps> = ({
  index,
  data,
  handleActivityChange,
  deleteActivity,
  handleDescriptionChange,
  addNewDescription,
  deleteDescription,
}) => {
  return (
    <div className="p-2 rounded relative flex flex-col gap-2 bg-gray-50">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-medium">{`Activity #${index + 1}`}</p>
        <ButtonWithCrossIcon onClick={() => deleteActivity(index)} />
      </div>
      <InputField
        value={data.activityTitle}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleActivityChange(index, 'activityTitle', event.target.value)
        }
        placeholder="Activity Title"
      />
      <InputField
        value={data.institutionName}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleActivityChange(index, 'institutionName', event.target.value)
        }
        placeholder="Institution Name"
      />
      <div className="flex gap-2">
        <InputField
          type="text"
          value={data.startDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleActivityChange(index, 'startDate', event.target.value)
          }
          placeholder="Start Date"
        />
        <InputField
          type="text"
          value={data.endDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleActivityChange(index, 'endDate', event.target.value)
          }
          placeholder="End Date"
        />
      </div>

      {data.descriptions.map((desc, descIndex) => (
        <div key={descIndex} className="flex items-center gap-2">
          <InputFieldV2
            type="text"
            value={desc}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              handleDescriptionChange(index, descIndex, event.target.value)
            }
            placeholder={`Description #${descIndex + 1}`}
            isDescriptionField
            contextData={{
              jobRole: data.activityTitle,
              companyName: data.institutionName,
            }}
            onApplySuggestion={(suggestion) =>
              handleDescriptionChange(index, descIndex, suggestion)
            }
          />
          <ButtonWithCrossIcon
            onClick={() => deleteDescription(index, descIndex)}
          />
        </div>
      ))}
      <ButtonWithPlusIcon
        onClick={() => addNewDescription(index)}
        label="Add Description"
      />
    </div>
  );
};
