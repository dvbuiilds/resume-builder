import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeStore } from '@resume-builder/components/resume-builder/store/resumeStore';
import type {
  Experience,
  SocialHandle,
} from '@resume-builder/components/resume-builder/types/resume-data';

describe('resumeStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useResumeStore.getState().resetToInitial();
  });

  describe('Initial state', () => {
    it('should have correct initial values', () => {
      const state = useResumeStore.getState();

      expect(state.resumeId).toBe('');
      expect(state.title).toBe('Your Name');
      expect(state.socialHandles).toHaveLength(2);
      expect(state.workExperience.experience).toHaveLength(1);
      expect(state.projects.projects).toHaveLength(1);
      expect(state.education.courses).toHaveLength(2);
      expect(state.activities.activities).toHaveLength(1);
      expect(state.skills.skillSet).toHaveLength(2);
      expect(state.achievements.achievementList).toHaveLength(1);
    });
  });

  describe('Title operations', () => {
    it('should set title', () => {
      useResumeStore.getState().setTitle('John Doe');
      expect(useResumeStore.getState().title).toBe('John Doe');
    });
  });

  describe('Social handles operations', () => {
    it('should set social handles', () => {
      const handles: SocialHandle[] = [
        { label: 'Email', link: 'mailto:test@example.com' },
        { label: 'LinkedIn', link: 'https://linkedin.com' },
      ];
      useResumeStore.getState().setSocialHandles(handles);
      expect(useResumeStore.getState().socialHandles).toEqual(handles);
    });

    it('should update social handle at index', () => {
      const initialState = useResumeStore.getState();
      const initialHandles = [...initialState.socialHandles];

      useResumeStore
        .getState()
        .updateSocialHandleAt(0, { label: 'Updated Email' });

      const updatedState = useResumeStore.getState();
      expect(updatedState.socialHandles[0].label).toBe('Updated Email');
      expect(updatedState.socialHandles[0].link).toBe(initialHandles[0].link);
    });

    it('should add social handle', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.socialHandles.length;

      useResumeStore.getState().addSocialHandle();

      expect(useResumeStore.getState().socialHandles).toHaveLength(
        initialLength + 1,
      );
      expect(useResumeStore.getState().socialHandles[initialLength]).toEqual({
        label: '',
        link: '',
      });
    });

    it('should add social handle with provided item', () => {
      const newHandle: SocialHandle = {
        label: 'GitHub',
        link: 'https://github.com',
      };
      useResumeStore.getState().addSocialHandle(newHandle);

      const handles = useResumeStore.getState().socialHandles;
      expect(handles[handles.length - 1]).toEqual(newHandle);
    });

    it('should remove social handle at index', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.socialHandles.length;

      useResumeStore.getState().removeSocialHandleAt(0);

      expect(useResumeStore.getState().socialHandles).toHaveLength(
        initialLength - 1,
      );
    });
  });

  describe('Work experience operations', () => {
    it('should set work experience title', () => {
      useResumeStore.getState().setWorkExperienceTitle('EMPLOYMENT HISTORY');
      expect(useResumeStore.getState().workExperience.title).toBe(
        'EMPLOYMENT HISTORY',
      );
    });

    it('should add experience', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.workExperience.experience.length;

      useResumeStore.getState().addExperience();

      expect(useResumeStore.getState().workExperience.experience).toHaveLength(
        initialLength + 1,
      );
    });

    it('should add experience with provided item', () => {
      const newExp: Experience = {
        companyName: 'Tech Corp',
        jobTitle: 'Developer',
        startDate: 'Jan 2023',
        endDate: 'Present',
        description: ['Worked on projects'],
      };

      useResumeStore.getState().addExperience(newExp);

      const experiences = useResumeStore.getState().workExperience.experience;
      expect(experiences[experiences.length - 1]).toEqual(newExp);
    });

    it('should update experience', () => {
      useResumeStore.getState().updateExperience(0, {
        companyName: 'Updated Company',
        jobTitle: 'Updated Title',
      });

      const exp = useResumeStore.getState().workExperience.experience[0];
      expect(exp.companyName).toBe('Updated Company');
      expect(exp.jobTitle).toBe('Updated Title');
    });

    it('should remove experience', () => {
      // Add an experience first
      useResumeStore.getState().addExperience();
      const lengthBefore =
        useResumeStore.getState().workExperience.experience.length;

      useResumeStore.getState().removeExperience(0);

      expect(useResumeStore.getState().workExperience.experience).toHaveLength(
        lengthBefore - 1,
      );
    });

    it('should add experience description', () => {
      const initialState = useResumeStore.getState();
      const initialDescLength =
        initialState.workExperience.experience[0].description.length;

      useResumeStore.getState().addExperienceDescription(0);

      expect(
        useResumeStore.getState().workExperience.experience[0].description,
      ).toHaveLength(initialDescLength + 1);
    });

    it('should update experience description', () => {
      useResumeStore
        .getState()
        .updateExperienceDescription(0, 0, 'Updated description');

      expect(
        useResumeStore.getState().workExperience.experience[0].description[0],
      ).toBe('Updated description');
    });

    it('should remove experience description', () => {
      // Add a description first
      useResumeStore.getState().addExperienceDescription(0, 'New description');
      const lengthBefore =
        useResumeStore.getState().workExperience.experience[0].description
          .length;

      useResumeStore.getState().removeExperienceDescription(0, 0);

      expect(
        useResumeStore.getState().workExperience.experience[0].description,
      ).toHaveLength(lengthBefore - 1);
    });
  });

  describe('Projects operations', () => {
    it('should set projects title', () => {
      useResumeStore.getState().setProjectsTitle('PORTFOLIO');
      expect(useResumeStore.getState().projects.title).toBe('PORTFOLIO');
    });

    it('should add project', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.projects.projects.length;

      useResumeStore.getState().addProject();

      expect(useResumeStore.getState().projects.projects).toHaveLength(
        initialLength + 1,
      );
    });

    it('should update project', () => {
      useResumeStore.getState().updateProject(0, {
        projectTitle: 'Updated Project',
        organizationName: 'Updated Org',
      });

      const project = useResumeStore.getState().projects.projects[0];
      expect(project.projectTitle).toBe('Updated Project');
      expect(project.organizationName).toBe('Updated Org');
    });

    it('should remove project', () => {
      useResumeStore.getState().addProject();
      const lengthBefore = useResumeStore.getState().projects.projects.length;

      useResumeStore.getState().removeProject(0);

      expect(useResumeStore.getState().projects.projects).toHaveLength(
        lengthBefore - 1,
      );
    });

    it('should add project description', () => {
      const initialState = useResumeStore.getState();
      const initialDescLength =
        initialState.projects.projects[0].description.length;

      useResumeStore.getState().addProjectDescription(0);

      expect(
        useResumeStore.getState().projects.projects[0].description,
      ).toHaveLength(initialDescLength + 1);
    });

    it('should update project description', () => {
      useResumeStore
        .getState()
        .updateProjectDescription(0, 0, 'Updated description');

      expect(
        useResumeStore.getState().projects.projects[0].description[0],
      ).toBe('Updated description');
    });

    it('should remove project description', () => {
      useResumeStore.getState().addProjectDescription(0, 'New description');
      const lengthBefore =
        useResumeStore.getState().projects.projects[0].description.length;

      useResumeStore.getState().removeProjectDescription(0, 0);

      expect(
        useResumeStore.getState().projects.projects[0].description,
      ).toHaveLength(lengthBefore - 1);
    });
  });

  describe('Education operations', () => {
    it('should set education title', () => {
      useResumeStore.getState().setEducationTitle('ACADEMIC BACKGROUND');
      expect(useResumeStore.getState().education.title).toBe(
        'ACADEMIC BACKGROUND',
      );
    });

    it('should add course', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.education.courses.length;

      useResumeStore.getState().addCourse();

      expect(useResumeStore.getState().education.courses).toHaveLength(
        initialLength + 1,
      );
    });

    it('should update course', () => {
      useResumeStore.getState().updateCourse(0, {
        courseName: 'Master of Science',
        institutionName: 'University',
      });

      const course = useResumeStore.getState().education.courses[0];
      expect(course.courseName).toBe('Master of Science');
      expect(course.institutionName).toBe('University');
    });

    it('should remove course', () => {
      useResumeStore.getState().addCourse();
      const lengthBefore = useResumeStore.getState().education.courses.length;

      useResumeStore.getState().removeCourse(0);

      expect(useResumeStore.getState().education.courses).toHaveLength(
        lengthBefore - 1,
      );
    });
  });

  describe('Activities operations', () => {
    it('should set activities title', () => {
      useResumeStore.getState().setActivitiesTitle('EXTRA CURRICULAR');
      expect(useResumeStore.getState().activities.title).toBe(
        'EXTRA CURRICULAR',
      );
    });

    it('should add activity', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.activities.activities.length;

      useResumeStore.getState().addActivity();

      expect(useResumeStore.getState().activities.activities).toHaveLength(
        initialLength + 1,
      );
    });

    it('should update activity', () => {
      useResumeStore.getState().updateActivity(0, {
        activityTitle: 'Volunteer Work',
        institutionName: 'Charity',
      });

      const activity = useResumeStore.getState().activities.activities[0];
      expect(activity.activityTitle).toBe('Volunteer Work');
      expect(activity.institutionName).toBe('Charity');
    });

    it('should remove activity', () => {
      useResumeStore.getState().addActivity();
      const lengthBefore =
        useResumeStore.getState().activities.activities.length;

      useResumeStore.getState().removeActivity(0);

      expect(useResumeStore.getState().activities.activities).toHaveLength(
        lengthBefore - 1,
      );
    });

    it('should add activity description', () => {
      const initialState = useResumeStore.getState();
      const initialDescLength =
        initialState.activities.activities[0].descriptions.length;

      useResumeStore.getState().addActivityDescription(0);

      expect(
        useResumeStore.getState().activities.activities[0].descriptions,
      ).toHaveLength(initialDescLength + 1);
    });

    it('should update activity description', () => {
      useResumeStore
        .getState()
        .updateActivityDescription(0, 0, 'Updated description');

      expect(
        useResumeStore.getState().activities.activities[0].descriptions[0],
      ).toBe('Updated description');
    });

    it('should remove activity description', () => {
      useResumeStore.getState().addActivityDescription(0, 'New description');
      const lengthBefore =
        useResumeStore.getState().activities.activities[0].descriptions.length;

      useResumeStore.getState().removeActivityDescription(0, 0);

      expect(
        useResumeStore.getState().activities.activities[0].descriptions,
      ).toHaveLength(lengthBefore - 1);
    });
  });

  describe('Skills operations', () => {
    it('should set skills title', () => {
      useResumeStore.getState().setSkillsTitle('TECHNICAL SKILLS');
      expect(useResumeStore.getState().skills.title).toBe('TECHNICAL SKILLS');
    });

    it('should add skill set', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.skills.skillSet.length;

      useResumeStore.getState().addSkillSet();

      expect(useResumeStore.getState().skills.skillSet).toHaveLength(
        initialLength + 1,
      );
    });

    it('should update skill set', () => {
      useResumeStore.getState().updateSkillSet(0, {
        title: 'Languages',
        skills: ['JavaScript', 'TypeScript'],
      });

      const skillSet = useResumeStore.getState().skills.skillSet[0];
      expect(skillSet.title).toBe('Languages');
      expect(skillSet.skills).toEqual(['JavaScript', 'TypeScript']);
    });

    it('should remove skill set', () => {
      useResumeStore.getState().addSkillSet();
      const lengthBefore = useResumeStore.getState().skills.skillSet.length;

      useResumeStore.getState().removeSkillSet(0);

      expect(useResumeStore.getState().skills.skillSet).toHaveLength(
        lengthBefore - 1,
      );
    });

    it('should add skill to set', () => {
      const initialState = useResumeStore.getState();
      const initialSkillsLength = initialState.skills.skillSet[0].skills.length;

      useResumeStore.getState().addSkillToSet(0);

      expect(useResumeStore.getState().skills.skillSet[0].skills).toHaveLength(
        initialSkillsLength + 1,
      );
    });

    it('should update skill in set', () => {
      useResumeStore.getState().updateSkillInSet(0, 0, 'Updated Skill');

      expect(useResumeStore.getState().skills.skillSet[0].skills[0]).toBe(
        'Updated Skill',
      );
    });

    it('should remove skill from set', () => {
      useResumeStore.getState().addSkillToSet(0, 'New Skill');
      const lengthBefore =
        useResumeStore.getState().skills.skillSet[0].skills.length;

      useResumeStore.getState().removeSkillFromSet(0, 0);

      expect(useResumeStore.getState().skills.skillSet[0].skills).toHaveLength(
        lengthBefore - 1,
      );
    });
  });

  describe('Achievements operations', () => {
    it('should set achievements title', () => {
      useResumeStore.getState().setAchievementsTitle('AWARDS & RECOGNITION');
      expect(useResumeStore.getState().achievements.title).toBe(
        'AWARDS & RECOGNITION',
      );
    });

    it('should add achievement', () => {
      const initialState = useResumeStore.getState();
      const initialLength = initialState.achievements.achievementList.length;

      useResumeStore.getState().addAchievement();

      expect(
        useResumeStore.getState().achievements.achievementList,
      ).toHaveLength(initialLength + 1);
    });

    it('should update achievement', () => {
      useResumeStore.getState().updateAchievement(0, {
        awardName: 'Best Developer',
        institutionName: 'Tech Awards',
      });

      const achievement =
        useResumeStore.getState().achievements.achievementList[0];
      expect(achievement.awardName).toBe('Best Developer');
      expect(achievement.institutionName).toBe('Tech Awards');
    });

    it('should remove achievement', () => {
      useResumeStore.getState().addAchievement();
      const lengthBefore =
        useResumeStore.getState().achievements.achievementList.length;

      useResumeStore.getState().removeAchievement(0);

      expect(
        useResumeStore.getState().achievements.achievementList,
      ).toHaveLength(lengthBefore - 1);
    });
  });

  describe('Store operations', () => {
    it('should set resume ID', () => {
      useResumeStore.getState().setResumeId('test-resume-id');
      expect(useResumeStore.getState().resumeId).toBe('test-resume-id');
    });

    it('should get snapshot', () => {
      useResumeStore.getState().setResumeId('test-id');
      useResumeStore.getState().setTitle('Test Name');

      const snapshot = useResumeStore.getState().getSnapshot();

      expect(snapshot.resumeId).toBe('test-id');
      expect(snapshot.data.title).toBe('Test Name');
      expect(snapshot.data).toHaveProperty('socialHandles');
      expect(snapshot.data).toHaveProperty('workExperience');
    });

    it('should hydrate from data', () => {
      const data = {
        title: 'Hydrated Name',
        socialHandles: [{ label: 'Email', link: 'mailto:test@example.com' }],
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

      useResumeStore.getState().hydrate(data, 'hydrated-id');

      const state = useResumeStore.getState();
      expect(state.resumeId).toBe('hydrated-id');
      expect(state.title).toBe('Hydrated Name');
      expect(state.socialHandles).toEqual(data.socialHandles);
    });

    it('should hydrate without resumeId', () => {
      const data = {
        title: 'Test',
        socialHandles: [],
        workExperience: { title: 'WORK EXPERIENCE', experience: [] },
        projects: { title: 'PROJECTS', projects: [] },
        education: { title: 'EDUCATION', courses: [] },
        activities: { title: 'ACTIVITIES', activities: [] },
        skills: { title: 'SKILLS', skillSet: [] },
        achievements: { title: 'ACHIEVEMENTS', achievementList: [] },
      };

      useResumeStore.getState().setResumeId('existing-id');
      useResumeStore.getState().hydrate(data);

      expect(useResumeStore.getState().resumeId).toBe('existing-id');
    });

    it('should reset to initial state', () => {
      useResumeStore.getState().setTitle('Changed Title');
      useResumeStore.getState().setResumeId('test-id');
      useResumeStore.getState().addExperience();

      useResumeStore.getState().resetToInitial();

      const state = useResumeStore.getState();
      expect(state.resumeId).toBe('');
      expect(state.title).toBe('Your Name');
      expect(state.workExperience.experience).toHaveLength(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty arrays', () => {
      useResumeStore.getState().setSocialHandles([]);
      expect(useResumeStore.getState().socialHandles).toHaveLength(0);
    });

    it('should handle updating non-existent index gracefully', () => {
      // updateExperience will throw when index is out of bounds due to Object.assign
      const initialState = useResumeStore.getState();
      const initialLength = initialState.workExperience.experience.length;

      // The implementation uses Object.assign which will throw on undefined
      expect(() => {
        useResumeStore
          .getState()
          .updateExperience(999, { companyName: 'Test' });
      }).toThrow();

      // Should not have added any experiences
      expect(useResumeStore.getState().workExperience.experience).toHaveLength(
        initialLength,
      );
    });

    it('should handle multiple rapid updates', () => {
      const store = useResumeStore.getState();
      for (let i = 0; i < 10; i++) {
        store.addExperience();
      }

      // Now update each one
      for (let i = 0; i < 10; i++) {
        store.updateExperience(i + 1, { companyName: `Company ${i}` }); // +1 because there's 1 initial
      }

      const experiences = useResumeStore.getState().workExperience.experience;
      expect(experiences).toHaveLength(11); // 1 initial + 10 added
      expect(experiences[1].companyName).toBe('Company 0');
    });
  });
});
