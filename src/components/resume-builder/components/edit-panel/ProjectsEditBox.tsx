import React, { type ChangeEvent } from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';
import type {
  Projects as ProjectsType,
  Project,
} from '../../types/resume-data';

// COMPONENTS
import { Experience } from '../../types/resume-data';
import {
  BlueButton,
  ButtonWithCrossIcon,
  ButtonWithPlusIcon,
  InputField,
} from './EditPanelComponents';

export const ProjectsEditBox: React.FC = () => {
  const projects = useResumeStore((s) => s.projects);
  const setProjectsTitle = useResumeStore((s) => s.setProjectsTitle);
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);
  const addProjectDescription = useResumeStore((s) => s.addProjectDescription);
  const updateProjectDescription = useResumeStore(
    (s) => s.updateProjectDescription,
  );
  const removeProjectDescription = useResumeStore(
    (s) => s.removeProjectDescription,
  );

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectsTitle(event.target.value);
  };

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string,
  ) => {
    updateProject(index, { [field]: value } as any);
  };

  const handleDescriptionChange = (
    projIndex: number,
    descIndex: number,
    value: string,
  ) => {
    updateProjectDescription(projIndex, descIndex, value);
  };

  const addNewProject = () => {
    addProject();
  };

  const deleteProject = (projIndex: number) => {
    if (projects.projects.length === 1) {
      alert('Minimum 1 Work Experience is needed!');
      return;
    }
    removeProject(projIndex);
  };

  const addNewDescription = (projIndex: number) => {
    addProjectDescription(projIndex);
  };

  const deleteDescription = (projIndex: number, descIndex: number) => {
    if (projects.projects[projIndex].description.length === 1) {
      alert('Atleast one description is needed for project.');
      return;
    }
    removeProjectDescription(projIndex, descIndex);
  };

  return (
    <div className="space-y-4">
      <InputField
        type="text"
        value={projects.title}
        onChange={handleTitleChange}
        placeholder="Project Title"
      />

      {projects.projects.map((project: Project, projIndex: number) => (
        <ProjectEditBox
          key={`projectsEditBox_${projIndex}`}
          index={projIndex}
          data={project}
          addNewDescription={addNewDescription}
          deleteDescription={deleteDescription}
          deleteProject={deleteProject}
          handleDescriptionChange={handleDescriptionChange}
          handleExperienceChange={handleExperienceChange}
        />
      ))}

      <BlueButton label="Add New Project" onClick={addNewProject} />
    </div>
  );
};

interface ProjectEditBoxProps {
  index: number;
  data: Project;
  handleExperienceChange: (
    index: number,
    keyName: keyof Experience,
    value: string,
  ) => void;
  deleteProject: (index: number) => void;
  handleDescriptionChange: (
    projIndex: number,
    descIndex: number,
    value: string,
  ) => void;
  addNewDescription: (index: number) => void;
  deleteDescription: (projIndex: number, descIndex: number) => void;
}

const ProjectEditBox: React.FC<ProjectEditBoxProps> = ({
  index,
  data,
  handleExperienceChange,
  deleteProject,
  handleDescriptionChange,
  addNewDescription,
  deleteDescription,
}) => {
  return (
    <div className="p-1 border rounded relative flex flex-col gap-1">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-medium">{`Project #${index + 1}`}</p>
        <ButtonWithCrossIcon onClick={() => deleteProject(index)} />
      </div>
      <InputField
        value={data.organizationName}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleExperienceChange(index, 'companyName', event.target.value)
        }
        placeholder="Company Name"
      />
      <InputField
        type="text"
        value={data.projectTitle}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleExperienceChange(index, 'jobTitle', event.target.value)
        }
        placeholder="Project Title"
      />
      <div className="flex gap-2">
        <InputField
          type="text"
          value={data.startDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleExperienceChange(index, 'startDate', event.target.value)
          }
          placeholder="Start Date"
        />
        <InputField
          type="text"
          value={data.endDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
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
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              handleDescriptionChange(index, descIndex, event.target.value)
            }
            placeholder={`Description #${descIndex}`}
            isDescriptionField
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
