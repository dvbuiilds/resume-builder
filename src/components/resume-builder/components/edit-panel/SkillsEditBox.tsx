import React, { type ChangeEvent } from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// COMPONENTS
import {
  BlueButton,
  ButtonWithCrossIcon,
  InputField,
} from './EditPanelComponents';

export const SkillsEditBox: React.FC = () => {
  const skills = useResumeStore((s) => s.skills);
  const setSkillsTitle = useResumeStore((s) => s.setSkillsTitle);
  const addSkillSet = useResumeStore((s) => s.addSkillSet);
  const updateSkillSet = useResumeStore((s) => s.updateSkillSet);
  const removeSkillSet = useResumeStore((s) => s.removeSkillSet);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSkillsTitle(event.target.value);
  };

  const handleSkillSetChange = (
    index: number,
    field: 'title' | 'skills',
    value: string,
  ) => {
    if (field === 'title') {
      updateSkillSet(index, { title: value });
    } else {
      updateSkillSet(index, {
        skills: value.split(',').map((skill) => skill.trim()),
      });
    }
  };

  const addNewSkillSet = () => {
    addSkillSet();
  };

  const deleteSkillSet = (index: number) => {
    if (skills.skillSet.length === 1) {
      alert('At least 1 skillset is required.');
      return;
    }
    removeSkillSet(index);
  };

  return (
    <div className="space-y-4">
      <InputField
        type="text"
        value={skills.title}
        onChange={handleTitleChange}
        placeholder="Skills Section Title"
      />

      {skills.skillSet.map((skillSet, index) => (
        <div
          key={index}
          className="p-1 border rounded relative flex flex-col gap-1"
        >
          <div className="flex flex-row items-center justify-between">
            <p className="text-xs font-medium">{`Skill Set #${index + 1}`}</p>
            <ButtonWithCrossIcon onClick={() => deleteSkillSet(index)} />
          </div>
          <InputField
            value={skillSet.title}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSkillSetChange(index, 'title', event.target.value)
            }
            placeholder="Skill Set Title"
          />
          <InputField
            value={skillSet.skills.join(', ')}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              handleSkillSetChange(index, 'skills', event.target.value)
            }
            placeholder="Skills (comma-separated)"
            isDescriptionField
          />
        </div>
      ))}

      <BlueButton label="Add New Skill Set" onClick={addNewSkillSet} />
    </div>
  );
};
