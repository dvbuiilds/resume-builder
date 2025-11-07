import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  ResumeDataProvider,
  useResumeData,
} from '@/components/resume-builder/context/ResumeDataContext';
import { mockSocialHandles, mockWorkExperience } from '../test-utils/test-data';

describe('ResumeDataContext', () => {
  describe('useResumeData hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useResumeData());
      }).toThrow('useResume must be used within a ResumeProvider');

      consoleSpy.mockRestore();
    });

    it('should provide initial state values', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      expect(result.current.title).toBe('Your Name');
      expect(result.current.socialHandles).toHaveLength(2);
      expect(result.current.workExperience.experience).toHaveLength(1);
      expect(result.current.projects.projects).toHaveLength(1);
      expect(result.current.education.courses).toHaveLength(2);
      expect(result.current.activities.activities).toHaveLength(1);
      expect(result.current.skills.skillSet).toHaveLength(2);
      expect(result.current.achievements.achievementList).toHaveLength(1);
    });

    it('should provide update functions for all sections', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      expect(typeof result.current.updateTitle).toBe('function');
      expect(typeof result.current.updateSocialHandles).toBe('function');
      expect(typeof result.current.updateWorkExperience).toBe('function');
      expect(typeof result.current.updateProjects).toBe('function');
      expect(typeof result.current.updateEducation).toBe('function');
      expect(typeof result.current.updateActivities).toBe('function');
      expect(typeof result.current.updateSkills).toBe('function');
      expect(typeof result.current.updateAchievements).toBe('function');
    });
  });

  describe('updateTitle', () => {
    it('should update title with new string value', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateTitle('Jane Smith');
      });

      expect(result.current.title).toBe('Jane Smith');
    });

    it('should update title with function updater', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateTitle((prev) => `${prev} - Updated`);
      });

      expect(result.current.title).toBe('Your Name - Updated');
    });

    it('should handle special characters in title', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateTitle("Dr. John O'Reilly-Smith, Jr.");
      });

      expect(result.current.title).toBe("Dr. John O'Reilly-Smith, Jr.");
    });
  });

  describe('updateSocialHandles', () => {
    it('should update social handles with new array', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateSocialHandles(mockSocialHandles);
      });

      expect(result.current.socialHandles).toHaveLength(3);
      expect(result.current.socialHandles[0].label).toBe('john@example.com');
    });

    it('should update social handles with function updater', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateSocialHandles((prev) => [
          ...prev,
          { label: 'GitHub', link: 'https://github.com' },
        ]);
      });

      expect(result.current.socialHandles).toHaveLength(3);
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateSocialHandles([]);
      });

      expect(result.current.socialHandles).toHaveLength(0);
    });
  });

  describe('updateWorkExperience', () => {
    it('should update work experience with new data', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateWorkExperience(mockWorkExperience);
      });

      expect(result.current.workExperience.experience).toHaveLength(2);
      expect(result.current.workExperience.experience[0].companyName).toBe(
        'Tech Corp',
      );
    });

    it('should update work experience with function updater', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateWorkExperience((prev) => ({
          ...prev,
          experience: [
            ...prev.experience,
            {
              companyName: 'New Company',
              jobTitle: 'Developer',
              startDate: 'Jan 2023',
              endDate: 'Present',
              description: ['New role'],
            },
          ],
        }));
      });

      expect(result.current.workExperience.experience).toHaveLength(2);
    });
  });

  describe('updateProjects', () => {
    it('should update projects with new data', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateProjects({
          title: 'PROJECTS',
          projects: [
            {
              organizationName: 'Personal',
              projectTitle: 'New Project',
              startDate: 'Jan 2023',
              endDate: 'Mar 2023',
              description: ['Project description'],
            },
          ],
        });
      });

      expect(result.current.projects.projects).toHaveLength(1);
      expect(result.current.projects.projects[0].projectTitle).toBe(
        'New Project',
      );
    });
  });

  describe('updateEducation', () => {
    it('should update education with new data', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateEducation({
          title: 'EDUCATION',
          courses: [
            {
              courseName: 'Master of Science',
              institutionName: 'Tech University',
              startDate: 'Sep 2018',
              endDate: 'May 2020',
              scoreEarned: '4.0 GPA',
              description: 'Graduated Summa Cum Laude',
            },
          ],
        });
      });

      expect(result.current.education.courses).toHaveLength(1);
      expect(result.current.education.courses[0].courseName).toBe(
        'Master of Science',
      );
    });
  });

  describe('updateActivities', () => {
    it('should update activities with new data', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateActivities({
          title: 'ACTIVITIES',
          activities: [
            {
              activityTitle: 'Volunteer Work',
              institutionName: 'Local Charity',
              startDate: 'Jan 2023',
              endDate: 'Present',
              descriptions: ['Helping the community'],
            },
          ],
        });
      });

      expect(result.current.activities.activities).toHaveLength(1);
      expect(result.current.activities.activities[0].activityTitle).toBe(
        'Volunteer Work',
      );
    });
  });

  describe('updateSkills', () => {
    it('should update skills with new data', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateSkills({
          title: 'SKILLS',
          skillSet: [
            {
              title: 'Languages',
              skills: ['JavaScript', 'TypeScript'],
            },
          ],
        });
      });

      expect(result.current.skills.skillSet).toHaveLength(1);
      expect(result.current.skills.skillSet[0].title).toBe('Languages');
    });
  });

  describe('updateAchievements', () => {
    it('should update achievements with new data', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      act(() => {
        result.current.updateAchievements({
          title: 'ACHIEVEMENTS',
          achievementList: [
            {
              awardName: 'Best Developer',
              institutionName: 'Tech Awards',
              dateAwarded: 'Dec 2023',
              description: 'Recognition for excellence',
            },
          ],
        });
      });

      expect(result.current.achievements.achievementList).toHaveLength(1);
      expect(result.current.achievements.achievementList[0].awardName).toBe(
        'Best Developer',
      );
    });
  });

  describe('State isolation', () => {
    it('should maintain separate state for each section', () => {
      const { result } = renderHook(() => useResumeData(), {
        wrapper: ResumeDataProvider,
      });

      const initialTitle = result.current.title;
      const initialSocialHandles = result.current.socialHandles;

      act(() => {
        result.current.updateTitle('New Title');
      });

      expect(result.current.title).toBe('New Title');
      expect(result.current.socialHandles).toBe(initialSocialHandles);
    });
  });
});
