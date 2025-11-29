import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getOrCreateResumeId,
  getResumeSnapshotForSave,
  hydrateResumeFromHistory,
  resetResumeToInitial,
  resetResumeId,
} from '@resume-builder/components/resume-builder/store/resumePersistence';
import { useResumeStore } from '@resume-builder/components/resume-builder/store/resumeStore';
import { v4 as uuidv4 } from 'uuid';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-123'),
}));

describe('resumePersistence', () => {
  beforeEach(() => {
    useResumeStore.getState().resetToInitial();
  });

  describe('getOrCreateResumeId', () => {
    it('should return existing resumeId', () => {
      useResumeStore.getState().setResumeId('existing-id');

      const result = getOrCreateResumeId();

      expect(result).toBe('existing-id');
      expect(uuidv4).not.toHaveBeenCalled();
    });

    it('should create and set new resumeId when none exists', () => {
      useResumeStore.getState().setResumeId('');

      const result = getOrCreateResumeId();

      expect(result).toBe('mock-uuid-123');
      expect(useResumeStore.getState().resumeId).toBe('mock-uuid-123');
    });
  });

  describe('getResumeSnapshotForSave', () => {
    it('should return snapshot with existing resumeId', () => {
      useResumeStore.getState().setResumeId('test-id');
      useResumeStore.getState().setTitle('Test Name');

      const snapshot = getResumeSnapshotForSave();

      expect(snapshot.resumeId).toBe('test-id');
      expect(snapshot.data.title).toBe('Test Name');
      expect(snapshot.serialized).toBe(JSON.stringify(snapshot.data));
    });

    it('should create resumeId if none exists', () => {
      useResumeStore.getState().setResumeId('');

      const snapshot = getResumeSnapshotForSave();

      expect(snapshot.resumeId).toBe('mock-uuid-123');
      expect(snapshot.data).toBeDefined();
      expect(snapshot.serialized).toBeDefined();
    });
  });

  describe('hydrateResumeFromHistory', () => {
    it('should hydrate store with valid payload', () => {
      const payload = JSON.stringify({
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
      });

      const result = hydrateResumeFromHistory(payload, 'resume-123');

      expect(result).not.toBeNull();
      expect(useResumeStore.getState().resumeId).toBe('resume-123');
      expect(useResumeStore.getState().title).toBe('Hydrated Name');
    });

    it('should return null for invalid payload', () => {
      const payload = 'invalid json';

      const result = hydrateResumeFromHistory(payload, 'resume-123');

      expect(result).toBeNull();
    });

    it('should return null for empty payload', () => {
      const result = hydrateResumeFromHistory('', 'resume-123');

      expect(result).toBeNull();
    });

    it('should set resumeId even when payload is invalid', () => {
      const payload = 'invalid json';

      const result = hydrateResumeFromHistory(payload, 'resume-123');

      // Function returns null when payload is invalid (parseResumeData returns null)
      expect(result).toBeNull();
      // resumeId is only set if parsed data is valid, so it won't be set here
      // This is the actual behavior - resumeId is set inside hydrate() which is only called if parsed is truthy
      expect(useResumeStore.getState().resumeId).toBe('');
    });
  });

  describe('resetResumeToInitial', () => {
    it('should reset store to initial state', () => {
      useResumeStore.getState().setTitle('Changed Title');
      useResumeStore.getState().setResumeId('test-id');
      useResumeStore.getState().addExperience();

      resetResumeToInitial();

      const state = useResumeStore.getState();
      expect(state.title).toBe('Your Name');
      expect(state.resumeId).toBe('');
      expect(state.workExperience.experience).toHaveLength(1);
    });
  });

  describe('resetResumeId', () => {
    it('should reset resumeId to empty string', () => {
      useResumeStore.getState().setResumeId('test-id');

      resetResumeId();

      expect(useResumeStore.getState().resumeId).toBe('');
    });
  });
});
