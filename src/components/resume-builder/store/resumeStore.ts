import { create } from 'zustand';

import type {
  Achievements,
  Activities,
  Education,
  Projects,
  Skills,
  SocialHandle,
  WorkExperience,
  Experience,
  Project,
  Course,
  ActivityItem,
  SkillSetItem,
  AchievementItem,
} from '../types/resume-data';

type SetState<T> = (partial: T | ((state: T) => T)) => void;

interface ResumeState {
  // Slices
  title: string;
  socialHandles: Array<SocialHandle>;
  workExperience: WorkExperience;
  projects: Projects;
  education: Education;
  activities: Activities;
  skills: Skills;
  achievements: Achievements;

  // Title
  setTitle: (value: string) => void;

  // Social Handles
  setSocialHandles: (handles: Array<SocialHandle>) => void;
  updateSocialHandleAt: (index: number, patch: Partial<SocialHandle>) => void;
  addSocialHandle: (item?: SocialHandle) => void;
  removeSocialHandleAt: (index: number) => void;

  // Work Experience
  setWorkExperienceTitle: (value: string) => void;
  addExperience: (item?: Experience) => void;
  updateExperience: (index: number, patch: Partial<Experience>) => void;
  removeExperience: (index: number) => void;
  addExperienceDescription: (expIndex: number, value?: string) => void;
  updateExperienceDescription: (
    expIndex: number,
    descIndex: number,
    value: string,
  ) => void;
  removeExperienceDescription: (expIndex: number, descIndex: number) => void;

  // Projects
  setProjectsTitle: (value: string) => void;
  addProject: (item?: Project) => void;
  updateProject: (index: number, patch: Partial<Project>) => void;
  removeProject: (index: number) => void;
  addProjectDescription: (projIndex: number, value?: string) => void;
  updateProjectDescription: (
    projIndex: number,
    descIndex: number,
    value: string,
  ) => void;
  removeProjectDescription: (projIndex: number, descIndex: number) => void;

  // Education
  setEducationTitle: (value: string) => void;
  addCourse: (item?: Course) => void;
  updateCourse: (index: number, patch: Partial<Course>) => void;
  removeCourse: (index: number) => void;

  // Activities
  setActivitiesTitle: (value: string) => void;
  addActivity: (item?: ActivityItem) => void;
  updateActivity: (index: number, patch: Partial<ActivityItem>) => void;
  removeActivity: (index: number) => void;
  addActivityDescription: (actIndex: number, value?: string) => void;
  updateActivityDescription: (
    actIndex: number,
    descIndex: number,
    value: string,
  ) => void;
  removeActivityDescription: (actIndex: number, descIndex: number) => void;

  // Skills
  setSkillsTitle: (value: string) => void;
  addSkillSet: (item?: SkillSetItem) => void;
  updateSkillSet: (index: number, patch: Partial<SkillSetItem>) => void;
  removeSkillSet: (index: number) => void;
  addSkillToSet: (setIndex: number, value?: string) => void;
  updateSkillInSet: (
    setIndex: number,
    skillIndex: number,
    value: string,
  ) => void;
  removeSkillFromSet: (setIndex: number, skillIndex: number) => void;

  // Achievements
  setAchievementsTitle: (value: string) => void;
  addAchievement: (item?: AchievementItem) => void;
  updateAchievement: (index: number, patch: Partial<AchievementItem>) => void;
  removeAchievement: (index: number) => void;
}

const initialResumeData: Pick<
  ResumeState,
  | 'title'
  | 'socialHandles'
  | 'workExperience'
  | 'projects'
  | 'education'
  | 'activities'
  | 'skills'
  | 'achievements'
> = {
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

export const useResumeStore = create<ResumeState>((set) => ({
  // initial state
  ...initialResumeData,

  // Title
  setTitle: (value) => set({ title: value }),

  // Social Handles
  setSocialHandles: (handles) => set({ socialHandles: handles }),
  updateSocialHandleAt: (index, patch) =>
    set((state) => ({
      socialHandles: state.socialHandles.map((h, i) =>
        i === index ? { ...h, ...patch } : h,
      ),
    })),
  addSocialHandle: (item) =>
    set((state) => ({
      socialHandles: [...state.socialHandles, item ?? { label: '', link: '' }],
    })),
  removeSocialHandleAt: (index) =>
    set((state) => ({
      socialHandles: state.socialHandles.filter((_, i) => i !== index),
    })),

  // Work Experience
  setWorkExperienceTitle: (value) =>
    set((state) => ({
      workExperience: { ...state.workExperience, title: value },
    })),
  addExperience: (item) =>
    set((state) => ({
      workExperience: {
        ...state.workExperience,
        experience: [
          ...state.workExperience.experience,
          item ?? {
            companyName: '',
            jobTitle: '',
            startDate: '',
            endDate: '',
            description: [''],
          },
        ],
      },
    })),
  updateExperience: (index, patch) =>
    set((state) => ({
      workExperience: {
        ...state.workExperience,
        experience: state.workExperience.experience.map((e, i) =>
          i === index ? { ...e, ...patch } : e,
        ),
      },
    })),
  removeExperience: (index) =>
    set((state) => ({
      workExperience: {
        ...state.workExperience,
        experience: state.workExperience.experience.filter(
          (_, i) => i !== index,
        ),
      },
    })),
  addExperienceDescription: (expIndex, value) =>
    set((state) => ({
      workExperience: {
        ...state.workExperience,
        experience: state.workExperience.experience.map((e, i) =>
          i === expIndex
            ? { ...e, description: [...e.description, value ?? ''] }
            : e,
        ),
      },
    })),
  updateExperienceDescription: (expIndex, descIndex, value) =>
    set((state) => ({
      workExperience: {
        ...state.workExperience,
        experience: state.workExperience.experience.map((e, i) => {
          if (i !== expIndex) return e;
          const next = [...e.description];
          next[descIndex] = value;
          return { ...e, description: next };
        }),
      },
    })),
  removeExperienceDescription: (expIndex, descIndex) =>
    set((state) => ({
      workExperience: {
        ...state.workExperience,
        experience: state.workExperience.experience.map((e, i) =>
          i === expIndex
            ? {
                ...e,
                description: e.description.filter((_, di) => di !== descIndex),
              }
            : e,
        ),
      },
    })),

  // Projects
  setProjectsTitle: (value) =>
    set((state) => ({ projects: { ...state.projects, title: value } })),
  addProject: (item) =>
    set((state) => ({
      projects: {
        ...state.projects,
        projects: [
          ...state.projects.projects,
          item ?? {
            organizationName: '',
            projectTitle: '',
            startDate: '',
            endDate: '',
            description: [''],
          },
        ],
      },
    })),
  updateProject: (index, patch) =>
    set((state) => ({
      projects: {
        ...state.projects,
        projects: state.projects.projects.map((p, i) =>
          i === index ? { ...p, ...patch } : p,
        ),
      },
    })),
  removeProject: (index) =>
    set((state) => ({
      projects: {
        ...state.projects,
        projects: state.projects.projects.filter((_, i) => i !== index),
      },
    })),
  addProjectDescription: (projIndex, value) =>
    set((state) => ({
      projects: {
        ...state.projects,
        projects: state.projects.projects.map((p, i) =>
          i === projIndex
            ? { ...p, description: [...p.description, value ?? ''] }
            : p,
        ),
      },
    })),
  updateProjectDescription: (projIndex, descIndex, value) =>
    set((state) => ({
      projects: {
        ...state.projects,
        projects: state.projects.projects.map((p, i) => {
          if (i !== projIndex) return p;
          const next = [...p.description];
          next[descIndex] = value;
          return { ...p, description: next };
        }),
      },
    })),
  removeProjectDescription: (projIndex, descIndex) =>
    set((state) => ({
      projects: {
        ...state.projects,
        projects: state.projects.projects.map((p, i) =>
          i === projIndex
            ? {
                ...p,
                description: p.description.filter((_, di) => di !== descIndex),
              }
            : p,
        ),
      },
    })),

  // Education
  setEducationTitle: (value) =>
    set((state) => ({ education: { ...state.education, title: value } })),
  addCourse: (item) =>
    set((state) => ({
      education: {
        ...state.education,
        courses: [
          ...state.education.courses,
          item ?? {
            courseName: '',
            institutionName: '',
            startDate: '',
            endDate: '',
            scoreEarned: '',
            description: '',
          },
        ],
      },
    })),
  updateCourse: (index, patch) =>
    set((state) => ({
      education: {
        ...state.education,
        courses: state.education.courses.map((c, i) =>
          i === index ? { ...c, ...patch } : c,
        ),
      },
    })),
  removeCourse: (index) =>
    set((state) => ({
      education: {
        ...state.education,
        courses: state.education.courses.filter((_, i) => i !== index),
      },
    })),

  // Activities
  setActivitiesTitle: (value) =>
    set((state) => ({ activities: { ...state.activities, title: value } })),
  addActivity: (item) =>
    set((state) => ({
      activities: {
        ...state.activities,
        activities: [
          ...state.activities.activities,
          item ?? {
            activityTitle: '',
            institutionName: '',
            startDate: '',
            endDate: '',
            descriptions: [''],
          },
        ],
      },
    })),
  updateActivity: (index, patch) =>
    set((state) => ({
      activities: {
        ...state.activities,
        activities: state.activities.activities.map((a, i) =>
          i === index ? { ...a, ...patch } : a,
        ),
      },
    })),
  removeActivity: (index) =>
    set((state) => ({
      activities: {
        ...state.activities,
        activities: state.activities.activities.filter((_, i) => i !== index),
      },
    })),
  addActivityDescription: (actIndex, value) =>
    set((state) => ({
      activities: {
        ...state.activities,
        activities: state.activities.activities.map((a, i) =>
          i === actIndex
            ? { ...a, descriptions: [...a.descriptions, value ?? ''] }
            : a,
        ),
      },
    })),
  updateActivityDescription: (actIndex, descIndex, value) =>
    set((state) => ({
      activities: {
        ...state.activities,
        activities: state.activities.activities.map((a, i) => {
          if (i !== actIndex) return a;
          const next = [...a.descriptions];
          next[descIndex] = value;
          return { ...a, descriptions: next };
        }),
      },
    })),
  removeActivityDescription: (actIndex, descIndex) =>
    set((state) => ({
      activities: {
        ...state.activities,
        activities: state.activities.activities.map((a, i) =>
          i === actIndex
            ? {
                ...a,
                descriptions: a.descriptions.filter(
                  (_, di) => di !== descIndex,
                ),
              }
            : a,
        ),
      },
    })),

  // Skills
  setSkillsTitle: (value) =>
    set((state) => ({ skills: { ...state.skills, title: value } })),
  addSkillSet: (item) =>
    set((state) => ({
      skills: {
        ...state.skills,
        skillSet: [
          ...state.skills.skillSet,
          item ?? { title: '', skills: [''] },
        ],
      },
    })),
  updateSkillSet: (index, patch) =>
    set((state) => ({
      skills: {
        ...state.skills,
        skillSet: state.skills.skillSet.map((s, i) =>
          i === index ? { ...s, ...patch } : s,
        ),
      },
    })),
  removeSkillSet: (index) =>
    set((state) => ({
      skills: {
        ...state.skills,
        skillSet: state.skills.skillSet.filter((_, i) => i !== index),
      },
    })),
  addSkillToSet: (setIndex, value) =>
    set((state) => ({
      skills: {
        ...state.skills,
        skillSet: state.skills.skillSet.map((s, i) =>
          i === setIndex ? { ...s, skills: [...s.skills, value ?? ''] } : s,
        ),
      },
    })),
  updateSkillInSet: (setIndex, skillIndex, value) =>
    set((state) => ({
      skills: {
        ...state.skills,
        skillSet: state.skills.skillSet.map((s, i) => {
          if (i !== setIndex) return s;
          const next = [...s.skills];
          next[skillIndex] = value;
          return { ...s, skills: next };
        }),
      },
    })),
  removeSkillFromSet: (setIndex, skillIndex) =>
    set((state) => ({
      skills: {
        ...state.skills,
        skillSet: state.skills.skillSet.map((s, i) =>
          i === setIndex
            ? { ...s, skills: s.skills.filter((_, si) => si !== skillIndex) }
            : s,
        ),
      },
    })),

  // Achievements
  setAchievementsTitle: (value) =>
    set((state) => ({ achievements: { ...state.achievements, title: value } })),
  addAchievement: (item) =>
    set((state) => ({
      achievements: {
        ...state.achievements,
        achievementList: [
          ...state.achievements.achievementList,
          item ?? {
            awardName: '',
            institutionName: '',
            dateAwarded: '',
            description: '',
          },
        ],
      },
    })),
  updateAchievement: (index, patch) =>
    set((state) => ({
      achievements: {
        ...state.achievements,
        achievementList: state.achievements.achievementList.map((a, i) =>
          i === index ? { ...a, ...patch } : a,
        ),
      },
    })),
  removeAchievement: (index) =>
    set((state) => ({
      achievements: {
        ...state.achievements,
        achievementList: state.achievements.achievementList.filter(
          (_, i) => i !== index,
        ),
      },
    })),
}));
