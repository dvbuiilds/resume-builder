import React from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// COMPONENTS
import { Experience } from '../../types/resume-data';
import {
  BlueButton,
  ButtonWithCrossIcon,
  ButtonWithPlusIcon,
  InputField,
} from './EditPanelComponents';

export const WorkExperienceEditBox: React.FC = () => {
  const workExperience = useResumeStore((s) => s.workExperience);
  const setWorkExperienceTitle = useResumeStore(
    (s) => s.setWorkExperienceTitle,
  );
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const addExperience = useResumeStore((s) => s.addExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);
  const addExperienceDescription = useResumeStore(
    (s) => s.addExperienceDescription,
  );
  const updateExperienceDescription = useResumeStore(
    (s) => s.updateExperienceDescription,
  );
  const removeExperienceDescription = useResumeStore(
    (s) => s.removeExperienceDescription,
  );

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkExperienceTitle(event.target.value);
  };

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string,
  ) => {
    updateExperience(index, { [field]: value } as any);
    return;
  };

  const handleDescriptionChange = (
    expIndex: number,
    descIndex: number,
    value: string,
  ) => {
    updateExperienceDescription(expIndex, descIndex, value);
  };

  const addNewExperience = () => {
    addExperience();
  };

  const deleteExperience = (index: number) => {
    if (workExperience.experience.length === 1) {
      alert('Minimum 1 Work Experience is needed!');
      return;
    }

    removeExperience(index);
  };

  const addNewDescription = (expIndex: number) => {
    addExperienceDescription(expIndex);
  };

  const deleteDescription = (expIndex: number, descIndex: number) => {
    if (workExperience.experience[expIndex].description.length === 1) {
      alert('Atleast one description is needed for experience.');
      return;
    }
    removeExperienceDescription(expIndex, descIndex);
  };

  return (
    <div className="space-y-4">
      <InputField
        type="text"
        value={workExperience.title}
        onChange={handleTitleChange}
        placeholder="Work Experience Title"
      />

      {workExperience.experience.map((exp, expIndex) => (
        <ExperienceEditBox
          key={`workExperienceEditBox_${expIndex}`}
          index={expIndex}
          data={exp}
          addNewDescription={addNewDescription}
          deleteDescription={deleteDescription}
          deleteExperience={deleteExperience}
          handleDescriptionChange={handleDescriptionChange}
          handleExperienceChange={handleExperienceChange}
        />
      ))}

      <BlueButton label="Add New Experience" onClick={addNewExperience} />
    </div>
  );
};

interface ExperienceEditBoxProps {
  index: number;
  data: Experience;
  handleExperienceChange: (
    index: number,
    keyName: keyof Experience,
    value: string,
  ) => void;
  deleteExperience: (index: number) => void;
  handleDescriptionChange: (
    expIndex: number,
    descIndex: number,
    value: string,
  ) => void;
  addNewDescription: (index: number) => void;
  deleteDescription: (expIndex: number, descIndex: number) => void;
}

const ExperienceEditBox: React.FC<ExperienceEditBoxProps> = ({
  index,
  data,
  handleExperienceChange,
  deleteExperience,
  handleDescriptionChange,
  addNewDescription,
  deleteDescription,
}) => {
  return (
    <div className="p-1 border rounded relative flex flex-col gap-1">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-medium">{`Experience #${index + 1}`}</p>
        <ButtonWithCrossIcon onClick={() => deleteExperience(index)} />
      </div>
      <InputField
        value={data.companyName}
        onChange={(event) =>
          handleExperienceChange(index, 'companyName', event.target.value)
        }
        placeholder="Company Name"
      />
      <InputField
        type="text"
        value={data.jobTitle}
        onChange={(event) =>
          handleExperienceChange(index, 'jobTitle', event.target.value)
        }
        placeholder="Job Title"
      />
      <div className="flex gap-2">
        <InputField
          type="text"
          value={data.startDate}
          onChange={(event) =>
            handleExperienceChange(index, 'startDate', event.target.value)
          }
          placeholder="Start Date"
        />
        <InputField
          type="text"
          value={data.endDate}
          onChange={(event) =>
            handleExperienceChange(index, 'endDate', event.target.value)
          }
          placeholder="End Date"
        />
      </div>

      {data.description.map((desc, descIndex) => (
        <div key={descIndex} className="flex items-center gap-2">
          <InputField
            type="text"
            value={desc}
            onChange={(event) =>
              handleDescriptionChange(index, descIndex, event.target.value)
            }
            placeholder={`Description #${descIndex}`}
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
