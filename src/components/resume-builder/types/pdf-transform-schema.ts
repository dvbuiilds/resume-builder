import { z } from 'zod';

import type {
  Achievements,
  Activities,
  Education,
  Projects,
  Skills,
  SocialHandle,
  WorkExperience,
  AchievementItem,
  ActivityItem,
  Course,
  Experience,
  Project,
  SkillSetItem,
} from './resume-data';

const rawStringSchema = z
  .string()
  .transform((value) => value.trim())
  .optional();

const descriptionArraySchema = z.array(rawStringSchema).optional();

const socialHandleSchema = z
  .object({
    label: rawStringSchema,
    link: rawStringSchema,
  })
  .partial();

const experienceSchema = z
  .object({
    companyName: rawStringSchema,
    jobTitle: rawStringSchema,
    startDate: rawStringSchema,
    endDate: rawStringSchema,
    description: descriptionArraySchema,
  })
  .partial();

const workExperienceSchema = z
  .object({
    title: rawStringSchema,
    experience: z.array(experienceSchema).optional(),
  })
  .partial();

const projectSchema = z
  .object({
    organizationName: rawStringSchema,
    projectTitle: rawStringSchema,
    startDate: rawStringSchema,
    endDate: rawStringSchema,
    description: descriptionArraySchema,
  })
  .partial();

const projectsSchema = z
  .object({
    title: rawStringSchema,
    projects: z.array(projectSchema).optional(),
  })
  .partial();

const courseSchema = z
  .object({
    courseName: rawStringSchema,
    institutionName: rawStringSchema,
    startDate: rawStringSchema,
    endDate: rawStringSchema,
    scoreEarned: rawStringSchema,
    description: rawStringSchema,
  })
  .partial();

const educationSchema = z
  .object({
    title: rawStringSchema,
    courses: z.array(courseSchema).optional(),
  })
  .partial();

const activitySchema = z
  .object({
    activityTitle: rawStringSchema,
    institutionName: rawStringSchema,
    startDate: rawStringSchema,
    endDate: rawStringSchema,
    descriptions: descriptionArraySchema,
  })
  .partial();

const activitiesSchema = z
  .object({
    title: rawStringSchema,
    activities: z.array(activitySchema).optional(),
  })
  .partial();

const skillSetSchema = z
  .object({
    title: rawStringSchema,
    skills: z.array(rawStringSchema).optional(),
  })
  .partial();

const skillsSchema = z
  .object({
    title: rawStringSchema,
    skillSet: z.array(skillSetSchema).optional(),
  })
  .partial();

const achievementSchema = z
  .object({
    awardName: rawStringSchema,
    institutionName: rawStringSchema,
    dateAwarded: rawStringSchema,
    description: rawStringSchema,
  })
  .partial();

const achievementsSchema = z
  .object({
    title: rawStringSchema,
    achievementList: z.array(achievementSchema).optional(),
  })
  .partial();

export const ResumeOutputSchema = z
  .object({
    title: rawStringSchema,
    socialHandles: z.array(socialHandleSchema).optional(),
    workExperience: workExperienceSchema.optional(),
    projects: projectsSchema.optional(),
    education: educationSchema.optional(),
    activities: activitiesSchema.optional(),
    skills: skillsSchema.optional(),
    achievements: achievementsSchema.optional(),
  })
  .partial();

const emptyWorkExperience: WorkExperience = {
  title: '',
  experience: [],
};
const emptyProjects: Projects = {
  title: '',
  projects: [],
};
const emptyEducation: Education = {
  title: '',
  courses: [],
};
const emptyActivities: Activities = {
  title: '',
  activities: [],
};
const emptySkills: Skills = {
  title: '',
  skillSet: [],
};
const emptyAchievements: Achievements = {
  title: '',
  achievementList: [],
};

const sanitizeString = (value: unknown): string => {
  const parsed = rawStringSchema.safeParse(value);
  return parsed.success && parsed.data ? parsed.data : '';
};

const sanitizeStringArray = (value: unknown): string[] => {
  const parsed = descriptionArraySchema.safeParse(value);
  if (!parsed.success || !parsed.data) {
    return [];
  }

  return parsed.data.map((item) => sanitizeString(item));
};

const sanitizeSocialHandle = (value: unknown): SocialHandle => {
  const parsed = socialHandleSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    label: sanitizeString(data.label),
    link: sanitizeString(data.link),
  };
};

const sanitizeExperience = (value: unknown): Experience => {
  const parsed = experienceSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    companyName: sanitizeString(data.companyName),
    jobTitle: sanitizeString(data.jobTitle),
    startDate: sanitizeString(data.startDate),
    endDate: sanitizeString(data.endDate),
    description: sanitizeStringArray(data.description),
  };
};

const sanitizeWorkExperience = (value: unknown): WorkExperience => {
  const parsed = workExperienceSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    title: sanitizeString(data.title),
    experience: Array.isArray(data.experience)
      ? data.experience.map(sanitizeExperience)
      : emptyWorkExperience.experience,
  };
};

const sanitizeProject = (value: unknown): Project => {
  const parsed = projectSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    organizationName: sanitizeString(data.organizationName),
    projectTitle: sanitizeString(data.projectTitle),
    startDate: sanitizeString(data.startDate),
    endDate: sanitizeString(data.endDate),
    description: sanitizeStringArray(data.description),
  };
};

const sanitizeProjects = (value: unknown): Projects => {
  const parsed = projectsSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    title: sanitizeString(data.title),
    projects: Array.isArray(data.projects)
      ? data.projects.map(sanitizeProject)
      : emptyProjects.projects,
  };
};

const sanitizeCourse = (value: unknown): Course => {
  const parsed = courseSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    courseName: sanitizeString(data.courseName),
    institutionName: sanitizeString(data.institutionName),
    startDate: sanitizeString(data.startDate),
    endDate: sanitizeString(data.endDate),
    scoreEarned: sanitizeString(data.scoreEarned),
    description: sanitizeString(data.description),
  };
};

const sanitizeEducation = (value: unknown): Education => {
  const parsed = educationSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    title: sanitizeString(data.title),
    courses: Array.isArray(data.courses)
      ? data.courses.map(sanitizeCourse)
      : emptyEducation.courses,
  };
};

const sanitizeActivity = (value: unknown): ActivityItem => {
  const parsed = activitySchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    activityTitle: sanitizeString(data.activityTitle),
    institutionName: sanitizeString(data.institutionName),
    startDate: sanitizeString(data.startDate),
    endDate: sanitizeString(data.endDate),
    descriptions: sanitizeStringArray(data.descriptions),
  };
};

const sanitizeActivities = (value: unknown): Activities => {
  const parsed = activitiesSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    title: sanitizeString(data.title),
    activities: Array.isArray(data.activities)
      ? data.activities.map(sanitizeActivity)
      : emptyActivities.activities,
  };
};

const sanitizeSkillSet = (value: unknown): SkillSetItem => {
  const parsed = skillSetSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    title: sanitizeString(data.title),
    skills: sanitizeStringArray(data.skills),
  };
};

const sanitizeSkills = (value: unknown): Skills => {
  const parsed = skillsSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    title: sanitizeString(data.title),
    skillSet: Array.isArray(data.skillSet)
      ? data.skillSet.map(sanitizeSkillSet)
      : emptySkills.skillSet,
  };
};

const sanitizeAchievement = (value: unknown): AchievementItem => {
  const parsed = achievementSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    awardName: sanitizeString(data.awardName),
    institutionName: sanitizeString(data.institutionName),
    dateAwarded: sanitizeString(data.dateAwarded),
    description: sanitizeString(data.description),
  };
};

const sanitizeAchievements = (value: unknown): Achievements => {
  const parsed = achievementsSchema.safeParse(value);
  const data = parsed.success && parsed.data ? parsed.data : {};

  return {
    title: sanitizeString(data.title),
    achievementList: Array.isArray(data.achievementList)
      ? data.achievementList.map(sanitizeAchievement)
      : emptyAchievements.achievementList,
  };
};

export interface ResumeOutput {
  title: string;
  socialHandles: SocialHandle[];
  workExperience: WorkExperience;
  projects: Projects;
  education: Education;
  activities: Activities;
  skills: Skills;
  achievements: Achievements;
}

export const sanitizeResumeOutput = (value: unknown): ResumeOutput => {
  const input =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};

  return {
    title: sanitizeString(input.title),
    socialHandles: Array.isArray(input.socialHandles)
      ? input.socialHandles.map(sanitizeSocialHandle)
      : [],
    workExperience: sanitizeWorkExperience(
      input.workExperience ?? emptyWorkExperience,
    ),
    projects: sanitizeProjects(input.projects ?? emptyProjects),
    education: sanitizeEducation(input.education ?? emptyEducation),
    activities: sanitizeActivities(input.activities ?? emptyActivities),
    skills: sanitizeSkills(input.skills ?? emptySkills),
    achievements: sanitizeAchievements(input.achievements ?? emptyAchievements),
  };
};
