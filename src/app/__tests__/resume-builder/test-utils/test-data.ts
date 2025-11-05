import type {
  Achievements,
  Activities,
  Education,
  Projects,
  Skills,
  SocialHandle,
  WorkExperience,
} from '@/components/resume-builder/types/resume-data';

export const mockSocialHandles: SocialHandle[] = [
  { label: 'john@example.com', link: 'mailto:john@example.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com/in/john' },
  { label: 'GitHub', link: 'https://github.com/john' },
];

export const mockWorkExperience: WorkExperience = {
  title: 'WORK EXPERIENCE',
  experience: [
    {
      companyName: 'Tech Corp',
      jobTitle: 'Senior Software Engineer',
      startDate: 'Jan 2020',
      endDate: 'Present',
      description: [
        'Led development of microservices architecture',
        'Mentored junior developers',
      ],
    },
    {
      companyName: 'Startup Inc',
      jobTitle: 'Software Engineer',
      startDate: 'Jun 2018',
      endDate: 'Dec 2019',
      description: ['Built REST APIs', 'Implemented CI/CD pipelines'],
    },
  ],
};

export const mockProjects: Projects = {
  title: 'PROJECTS',
  projects: [
    {
      organizationName: 'Personal',
      projectTitle: 'E-commerce Platform',
      startDate: 'Mar 2021',
      endDate: 'Jun 2021',
      description: [
        'Full-stack application with React and Node.js',
        'Implemented payment gateway integration',
      ],
    },
  ],
};

export const mockEducation: Education = {
  title: 'EDUCATION',
  courses: [
    {
      courseName: 'Bachelor of Science in Computer Science',
      institutionName: 'State University',
      startDate: 'Sep 2014',
      endDate: 'May 2018',
      scoreEarned: '3.8 GPA',
      description: 'Graduated Magna Cum Laude',
    },
  ],
};

export const mockActivities: Activities = {
  title: 'ACTIVITIES',
  activities: [
    {
      activityTitle: 'Open Source Contributor',
      institutionName: 'Various Projects',
      startDate: 'Jan 2019',
      endDate: 'Present',
      descriptions: [
        'Contributed to major open source projects',
        'Maintained community documentation',
      ],
    },
  ],
};

export const mockSkills: Skills = {
  title: 'SKILLS',
  skillSet: [
    {
      title: 'Programming Languages',
      skills: ['JavaScript', 'TypeScript', 'Python', 'Java'],
    },
    {
      title: 'Frameworks',
      skills: ['React', 'Node.js', 'Express', 'Next.js'],
    },
  ],
};

export const mockAchievements: Achievements = {
  title: 'ACHIEVEMENTS',
  achievementList: [
    {
      awardName: 'Employee of the Year',
      institutionName: 'Tech Corp',
      dateAwarded: 'Dec 2022',
      description: 'Recognized for outstanding contributions',
    },
  ],
};

export const completeResumeData = {
  title: 'John Doe',
  socialHandles: mockSocialHandles,
  workExperience: mockWorkExperience,
  projects: mockProjects,
  education: mockEducation,
  activities: mockActivities,
  skills: mockSkills,
  achievements: mockAchievements,
};

export const emptyResumeData = {
  title: '',
  socialHandles: [],
  workExperience: {
    title: 'WORK EXPERIENCE',
    experience: [],
  },
  projects: {
    title: 'PROJECTS',
    projects: [],
  },
  education: {
    title: 'EDUCATION',
    courses: [],
  },
  activities: {
    title: 'ACTIVITIES',
    activities: [],
  },
  skills: {
    title: 'SKILLS',
    skillSet: [],
  },
  achievements: {
    title: 'ACHIEVEMENTS',
    achievementList: [],
  },
};

