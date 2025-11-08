import React, { createContext, useContext, useState, ReactNode } from 'react';
import type {
  Achievements,
  Activities,
  Education,
  Projects,
  Skills,
  SocialHandle,
  WorkExperience,
} from '../types/resume-data';

export interface ResumeDataContextType {
  title: string;
  updateTitle: React.Dispatch<React.SetStateAction<string>>;
  socialHandles: Array<SocialHandle>;
  updateSocialHandles: React.Dispatch<
    React.SetStateAction<Array<SocialHandle>>
  >;
  workExperience: WorkExperience;
  updateWorkExperience: React.Dispatch<React.SetStateAction<WorkExperience>>;
  projects: Projects;
  updateProjects: React.Dispatch<React.SetStateAction<Projects>>;
  education: Education;
  updateEducation: React.Dispatch<React.SetStateAction<Education>>;
  activities: Activities;
  updateActivities: React.Dispatch<React.SetStateAction<Activities>>;
  skills: Skills;
  updateSkills: React.Dispatch<React.SetStateAction<Skills>>;
  achievements: Achievements;
  updateAchievements: React.Dispatch<React.SetStateAction<Achievements>>;
}

const ResumeDataContext = createContext<ResumeDataContextType | undefined>(
  undefined,
);

const initialResumeData: {
  title: string;
  socialHandles: Array<SocialHandle>;
  workExperience: WorkExperience;
  projects: Projects;
  education: Education;
  activities: Activities;
  skills: Skills;
  achievements: Achievements;
} = {
  title: 'Your Name',
  socialHandles: [
    { label: 'abc@example.com', link: '#use mailto: in the link' },
    { label: 'LinkedIn', link: '#' },
  ],
  workExperience: {
    title: 'WORK EXPERIENCE',
    experience: [
      {
        companyName: 'Google Inc.',
        jobTitle: 'Software Engineer',
        startDate: 'June 2023',
        endDate: 'Present',
        description: ['Worked on YouTube Ads Scaling.'],
      },
    ],
  },
  projects: {
    title: 'PROJECTS',
    projects: [
      {
        organizationName: 'Google Cloud.',
        projectTitle: 'To do App',
        startDate: 'June 2022',
        endDate: 'Aug 2022',
        description: ['Worked on YouTube Ads Scaling.'],
      },
    ],
  },
  education: {
    title: 'EDUCATION',
    courses: [
      {
        courseName: 'Bachelor of Science in Computer Science',
        institutionName: 'University of Technology',
        startDate: 'May 2019',
        endDate: 'May 2023',
        scoreEarned: '9.23 GPA',
        description:
          'Specialized in Artificial Intelligence and Data Science. Completed a capstone project on machine learning algorithms for predictive analytics.',
      },
      {
        courseName: 'Intermediate PCM',
        institutionName: 'Central High School',
        startDate: 'Mar 2016',
        endDate: 'Mar 2018',
        scoreEarned: '93.4%',
        description:
          'Valedictorian. President of the Computer Science Club. Participated in national mathematics olympiad.',
      },
    ],
  },
  activities: {
    title: 'ACTIVITIES',
    activities: [
      {
        activityTitle: 'Student Council President',
        institutionName: 'University of Example',
        startDate: 'Sept 2021',
        endDate: 'May 2022',
        descriptions: [
          'Led weekly meetings to address student concerns',
          'Organized campus-wide events with over 1000 participants',
        ],
      },
    ],
  },
  skills: {
    title: 'SKILLS',
    skillSet: [
      {
        title: 'Programming Languages',
        skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'SQL'],
      },
      {
        title: 'Soft Skills',
        skills: [
          'Team Leadership',
          'Agile Methodologies',
          'Technical Writing',
          'Public Speaking',
        ],
      },
    ],
  },
  achievements: {
    title: 'ACHIEVEMENTS',
    achievementList: [
      {
        awardName: 'Best Paper Award',
        institutionName: 'International Conference on Computer Science',
        dateAwarded: 'May 2023',
        description:
          "Received for the paper 'Novel Approaches in Machine Learning'",
      },
    ],
  },
};

export const ResumeDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  /**
   * States to save the Resume Data.
   * At the same time, I decided to keep the states seperate and not a consolidated object, because updating the state can be a tedious task for sections like Work Experience, etc that have big complex objects. Eg. Title component is not concerned about the WorkExperience state data. But managing one consolidated state in a big object will cause performance issues as updating one description in nth experience in workExperience will re-render the whole resume since state is changed and reloading one big state will be challenging depending on the device.
   */
  const [title, updateTitle] = useState<string>(initialResumeData.title);
  const [socialHandles, updateSocialHandles] = useState<Array<SocialHandle>>(
    initialResumeData.socialHandles,
  );
  const [workExperience, updateWorkExperience] = useState<WorkExperience>(
    initialResumeData.workExperience,
  );
  const [projects, updateProjects] = useState<Projects>(
    initialResumeData.projects,
  );
  const [education, updateEducation] = useState<Education>(
    initialResumeData.education,
  );
  const [activities, updateActivities] = useState<Activities>(
    initialResumeData.activities,
  );
  const [skills, updateSkills] = useState<Skills>(initialResumeData.skills);
  const [achievements, updateAchievements] = useState<Achievements>(
    initialResumeData.achievements,
  );

  return (
    <ResumeDataContext.Provider
      value={{
        title,
        updateTitle,
        socialHandles,
        updateSocialHandles,
        workExperience,
        updateWorkExperience,
        projects,
        updateProjects,
        education,
        updateEducation,
        activities,
        updateActivities,
        skills,
        updateSkills,
        achievements,
        updateAchievements,
      }}
    >
      {children}
    </ResumeDataContext.Provider>
  );
};

export const useResumeData = () => {
  const context = useContext(ResumeDataContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
