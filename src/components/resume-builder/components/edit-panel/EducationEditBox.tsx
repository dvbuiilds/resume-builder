import React, { ChangeEvent } from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// COMPONENTS
import { Course } from '../../types/resume-data';
import {
  BlueButton,
  ButtonWithCrossIcon,
  InputField,
} from './EditPanelComponents';

export const EducationEditBox: React.FC = () => {
  const education = useResumeStore((s) => s.education);
  const setEducationTitle = useResumeStore((s) => s.setEducationTitle);
  const addCourse = useResumeStore((s) => s.addCourse);
  const updateCourse = useResumeStore((s) => s.updateCourse);
  const removeCourse = useResumeStore((s) => s.removeCourse);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEducationTitle(event.target.value);
  };

  const handleCourseChange = (
    index: number,
    field: keyof Course,
    value: string,
  ) => {
    updateCourse(index, { [field]: value } as any);
  };

  const addNewCourse = () => {
    addCourse();
  };

  const deleteCourse = (courseIndex: number) => {
    if (education.courses.length === 1) {
      alert('Minimum 1 Education entry is needed!');
      return;
    }
    removeCourse(courseIndex);
  };

  return (
    <div className="space-y-4">
      <InputField
        type="text"
        value={education.title}
        onChange={handleTitleChange}
        placeholder="Education Section Title"
      />
      {education.courses.map((course, courseIndex) => (
        <CourseEditBox
          key={`courseEditBox_${courseIndex}`}
          index={courseIndex}
          data={course}
          deleteCourse={deleteCourse}
          handleCourseChange={handleCourseChange}
        />
      ))}

      <BlueButton label="Add New Education" onClick={addNewCourse} />
    </div>
  );
};

interface CourseEditBoxProps {
  index: number;
  data: Course;
  handleCourseChange: (
    index: number,
    keyName: keyof Course,
    value: string,
  ) => void;
  deleteCourse: (index: number) => void;
}

const CourseEditBox: React.FC<CourseEditBoxProps> = ({
  index,
  data,
  handleCourseChange,
  deleteCourse,
}) => {
  return (
    <div className="p-2 rounded relative flex flex-col gap-2 bg-gray-50">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-medium">{`Education #${index + 1}`}</p>
        <ButtonWithCrossIcon onClick={() => deleteCourse(index)} />
      </div>
      <InputField
        value={data.institutionName}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleCourseChange(index, 'institutionName', event.target.value)
        }
        placeholder="Institution Name"
      />
      <InputField
        value={data.courseName}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleCourseChange(index, 'courseName', event.target.value)
        }
        placeholder="Course Name"
      />
      <div className="flex gap-2">
        <InputField
          type="text"
          value={data.startDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleCourseChange(index, 'startDate', event.target.value)
          }
          placeholder="Start Date"
        />
        <InputField
          type="text"
          value={data.endDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleCourseChange(index, 'endDate', event.target.value)
          }
          placeholder="End Date"
        />
      </div>
      <InputField
        value={data.scoreEarned}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleCourseChange(index, 'scoreEarned', event.target.value)
        }
        placeholder="Score Earned"
      />
      <InputField
        value={data.description}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleCourseChange(index, 'description', event.target.value)
        }
        placeholder="Description"
      />
    </div>
  );
};
