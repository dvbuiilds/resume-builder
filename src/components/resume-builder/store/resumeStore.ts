import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

import { createDualStorage } from '@resume-builder/lib/storage';

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
import type { ResumeOutput } from '../types/pdf-transform-schema';

const cloneInitialResumeData = (): typeof initialResumeData =>
  JSON.parse(JSON.stringify(initialResumeData));

interface ResumeState {
  // Slices
  resumeId: string;
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

  hydrate: (data: ResumeOutput, resumeId?: string) => void;
  setResumeId: (resumeId: string) => void;
  getSnapshot: () => { resumeId: string; data: ResumeOutput };
  resetToInitial: () => void;
}

const initialResumeData: Pick<
  ResumeState,
  | 'resumeId'
  | 'title'
  | 'socialHandles'
  | 'workExperience'
  | 'projects'
  | 'education'
  | 'activities'
  | 'skills'
  | 'achievements'
> = {
  resumeId: '',
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

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      // initial state
      ...initialResumeData,

      // Title
      setTitle: (value) => set({ title: value }),

      // Social Handles
      setSocialHandles: (handles) => set({ socialHandles: handles }),
      updateSocialHandleAt: (index, patch) =>
        set(
          produce((state) => {
            Object.assign(state.socialHandles[index], patch);
          }),
        ),
      addSocialHandle: (item) =>
        set((state) => ({
          socialHandles: [
            ...state.socialHandles,
            item ?? { label: '', link: '' },
          ],
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
        set(
          produce((state) => {
            Object.assign(state.workExperience.experience[index], patch);
          }),
        ),
      removeExperience: (index) =>
        set(
          produce((state) => {
            state.workExperience.experience.splice(index, 1);
          }),
        ),
      addExperienceDescription: (expIndex, value) =>
        set(
          produce((state) => {
            state.workExperience.experience[expIndex].description.push(
              value ?? '',
            );
          }),
        ),
      updateExperienceDescription: (expIndex, descIndex, value) =>
        set(
          produce((state) => {
            state.workExperience.experience[expIndex].description[descIndex] =
              value;
          }),
        ),
      removeExperienceDescription: (expIndex, descIndex) =>
        set(
          produce((state) => {
            state.workExperience.experience[expIndex].description.splice(
              descIndex,
              1,
            );
          }),
        ),

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
        set(
          produce((state) => {
            Object.assign(state.projects.projects[index], patch);
          }),
        ),
      removeProject: (index) =>
        set(
          produce((state) => {
            state.projects.projects.splice(index, 1);
          }),
        ),
      addProjectDescription: (projIndex, value) =>
        set(
          produce((state) => {
            state.projects.projects[projIndex].description.push(value ?? '');
          }),
        ),
      updateProjectDescription: (projIndex, descIndex, value) =>
        set(
          produce((state) => {
            state.projects.projects[projIndex].description[descIndex] = value;
          }),
        ),
      removeProjectDescription: (projIndex, descIndex) =>
        set(
          produce((state) => {
            state.projects.projects[projIndex].description.splice(descIndex, 1);
          }),
        ),

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
        set(
          produce((state) => {
            Object.assign(state.education.courses[index], patch);
          }),
        ),
      removeCourse: (index) =>
        set(
          produce((state) => {
            state.education.courses.splice(index, 1);
          }),
        ),

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
        set(
          produce((state) => {
            Object.assign(state.activities.activities[index], patch);
          }),
        ),
      removeActivity: (index) =>
        set(
          produce((state) => {
            state.activities.activities.splice(index, 1);
          }),
        ),
      addActivityDescription: (actIndex, value) =>
        set(
          produce((state) => {
            state.activities.activities[actIndex].descriptions.push(
              value ?? '',
            );
          }),
        ),
      updateActivityDescription: (actIndex, descIndex, value) =>
        set(
          produce((state) => {
            state.activities.activities[actIndex].descriptions[descIndex] =
              value;
          }),
        ),
      removeActivityDescription: (actIndex, descIndex) =>
        set(
          produce((state) => {
            state.activities.activities[actIndex].descriptions.splice(
              descIndex,
              1,
            );
          }),
        ),

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
        set(
          produce((state) => {
            Object.assign(state.skills.skillSet[index], patch);
          }),
        ),
      removeSkillSet: (index) =>
        set(
          produce((state) => {
            state.skills.skillSet.splice(index, 1);
          }),
        ),
      addSkillToSet: (setIndex, value) =>
        set(
          produce((state) => {
            state.skills.skillSet[setIndex].skills.push(value ?? '');
          }),
        ),
      updateSkillInSet: (setIndex, skillIndex, value) =>
        set(
          produce((state) => {
            state.skills.skillSet[setIndex].skills[skillIndex] = value;
          }),
        ),
      removeSkillFromSet: (setIndex, skillIndex) =>
        set(
          produce((state) => {
            state.skills.skillSet[setIndex].skills.splice(skillIndex, 1);
          }),
        ),

      // Achievements
      setAchievementsTitle: (value) =>
        set((state) => ({
          achievements: { ...state.achievements, title: value },
        })),
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
        set(
          produce((state) => {
            Object.assign(state.achievements.achievementList[index], patch);
          }),
        ),
      removeAchievement: (index) =>
        set((state) => ({
          achievements: {
            ...state.achievements,
            achievementList: state.achievements.achievementList.filter(
              (_, i) => i !== index,
            ),
          },
        })),

      setResumeId: (resumeId) => set({ resumeId }),
      resetToInitial: () =>
        set(() => {
          const base = cloneInitialResumeData();
          const { resumeId: _ignored, ...rest } = base;
          return {
            resumeId: '',
            ...rest,
          };
        }),
      hydrate: (data, resumeId) =>
        set(() => ({
          resumeId: resumeId ?? get().resumeId,
          title: data.title,
          socialHandles: data.socialHandles,
          workExperience: data.workExperience,
          projects: data.projects,
          education: data.education,
          activities: data.activities,
          skills: data.skills,
          achievements: data.achievements,
        })),
      getSnapshot: () => {
        const state = get();
        return {
          resumeId: state.resumeId,
          data: {
            title: state.title,
            socialHandles: state.socialHandles,
            workExperience: state.workExperience,
            projects: state.projects,
            education: state.education,
            activities: state.activities,
            skills: state.skills,
            achievements: state.achievements,
          },
        };
      },
    }),
    {
      name: 'resume-builder-state',
      storage: createDualStorage(),
      partialize: (state) => ({
        resumeId: state.resumeId,
        title: state.title,
        socialHandles: state.socialHandles,
        workExperience: state.workExperience,
        projects: state.projects,
        education: state.education,
        activities: state.activities,
        skills: state.skills,
        achievements: state.achievements,
      }),
    },
  ),
);
