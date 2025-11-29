import { describe, it, expect, beforeEach } from 'vitest';
import { useUserResumeStore } from '@resume-builder/components/resume-builder/store/userResumeStore';
import type { HistoryEntry } from '@resume-builder/components/resume-builder/context/HistoryContext';

describe('userResumeStore', () => {
  beforeEach(() => {
    useUserResumeStore.getState().clearResumes();
  });

  describe('Initial state', () => {
    it('should have correct initial values', () => {
      const state = useUserResumeStore.getState();

      expect(state.resumes).toEqual([]);
      expect(state.resumeCount).toBe(0);
      expect(state.lastFetched).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setResumes', () => {
    it('should set resumes and update count', () => {
      const resumes: HistoryEntry[] = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Resume 1"}',
          updatedAt: Date.now(),
        },
        {
          rowId: 'row-2',
          resumeId: 'resume-2',
          data: '{"title":"Resume 2"}',
          updatedAt: Date.now() - 1000,
        },
      ];

      useUserResumeStore.getState().setResumes(resumes);

      const state = useUserResumeStore.getState();
      expect(state.resumes).toEqual(resumes);
      expect(state.resumeCount).toBe(2);
      expect(state.lastFetched).not.toBeNull();
      expect(state.error).toBeNull();
    });

    it('should handle empty array', () => {
      useUserResumeStore.getState().setResumes([]);

      const state = useUserResumeStore.getState();
      expect(state.resumes).toEqual([]);
      expect(state.resumeCount).toBe(0);
    });
  });

  describe('addResume', () => {
    it('should add new resume', () => {
      const resume: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"New Resume"}',
        updatedAt: Date.now(),
      };

      useUserResumeStore.getState().addResume(resume);

      const state = useUserResumeStore.getState();
      expect(state.resumes).toHaveLength(1);
      expect(state.resumes[0]).toEqual(resume);
      expect(state.resumeCount).toBe(1);
      expect(state.lastFetched).not.toBeNull();
    });

    it('should update existing resume instead of adding duplicate', () => {
      const resume1: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Original"}',
        updatedAt: Date.now(),
      };

      const resume2: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Updated"}',
        updatedAt: Date.now() + 1000,
      };

      useUserResumeStore.getState().addResume(resume1);
      useUserResumeStore.getState().addResume(resume2);

      const state = useUserResumeStore.getState();
      expect(state.resumes).toHaveLength(1);
      expect(state.resumes[0].data).toBe('{"title":"Updated"}');
      expect(state.resumeCount).toBe(1);
    });

    it('should add multiple different resumes', () => {
      const resume1: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Resume 1"}',
        updatedAt: Date.now(),
      };

      const resume2: HistoryEntry = {
        rowId: 'row-2',
        resumeId: 'resume-2',
        data: '{"title":"Resume 2"}',
        updatedAt: Date.now(),
      };

      useUserResumeStore.getState().addResume(resume1);
      useUserResumeStore.getState().addResume(resume2);

      const state = useUserResumeStore.getState();
      expect(state.resumes).toHaveLength(2);
      expect(state.resumeCount).toBe(2);
    });
  });

  describe('updateResume', () => {
    it('should update existing resume', () => {
      const resume: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Original"}',
        updatedAt: Date.now(),
      };

      useUserResumeStore.getState().addResume(resume);
      const newUpdatedAt = Date.now() + 1000;

      useUserResumeStore
        .getState()
        .updateResume('resume-1', '{"title":"Updated"}', newUpdatedAt);

      const state = useUserResumeStore.getState();
      expect(state.resumes[0].data).toBe('{"title":"Updated"}');
      expect(state.resumes[0].updatedAt).toBe(newUpdatedAt);
      expect(state.lastFetched).not.toBeNull();
    });

    it('should not update non-existent resume', () => {
      const initialState = useUserResumeStore.getState();
      const initialResumes = [...initialState.resumes];

      useUserResumeStore
        .getState()
        .updateResume('non-existent', '{"title":"Test"}', Date.now());

      const state = useUserResumeStore.getState();
      expect(state.resumes).toEqual(initialResumes);
    });
  });

  describe('deleteResume', () => {
    it('should delete resume by resumeId', () => {
      const resume1: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Resume 1"}',
        updatedAt: Date.now(),
      };

      const resume2: HistoryEntry = {
        rowId: 'row-2',
        resumeId: 'resume-2',
        data: '{"title":"Resume 2"}',
        updatedAt: Date.now(),
      };

      useUserResumeStore.getState().addResume(resume1);
      useUserResumeStore.getState().addResume(resume2);

      useUserResumeStore.getState().deleteResume('resume-1');

      const state = useUserResumeStore.getState();
      expect(state.resumes).toHaveLength(1);
      expect(state.resumes[0].resumeId).toBe('resume-2');
      expect(state.resumeCount).toBe(1);
      expect(state.lastFetched).not.toBeNull();
    });

    it('should handle deleting non-existent resume', () => {
      const resume: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Resume 1"}',
        updatedAt: Date.now(),
      };

      useUserResumeStore.getState().addResume(resume);
      const lengthBefore = useUserResumeStore.getState().resumes.length;

      useUserResumeStore.getState().deleteResume('non-existent');

      const state = useUserResumeStore.getState();
      expect(state.resumes).toHaveLength(lengthBefore);
    });
  });

  describe('clearResumes', () => {
    it('should clear all resumes and reset state', () => {
      const resume: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Resume 1"}',
        updatedAt: Date.now(),
      };

      useUserResumeStore.getState().addResume(resume);
      useUserResumeStore.getState().setError('Some error');

      useUserResumeStore.getState().clearResumes();

      const state = useUserResumeStore.getState();
      expect(state.resumes).toEqual([]);
      expect(state.resumeCount).toBe(0);
      expect(state.lastFetched).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      useUserResumeStore.getState().setLoading(true);
      expect(useUserResumeStore.getState().isLoading).toBe(true);

      useUserResumeStore.getState().setLoading(false);
      expect(useUserResumeStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useUserResumeStore.getState().setError('Test error');
      expect(useUserResumeStore.getState().error).toBe('Test error');

      useUserResumeStore.getState().setError(null);
      expect(useUserResumeStore.getState().error).toBeNull();
    });
  });

  describe('Resume count calculation', () => {
    it('should calculate count correctly after delete', () => {
      const resumes: HistoryEntry[] = [
        {
          rowId: 'row-1',
          resumeId: 'resume-1',
          data: '{"title":"Resume 1"}',
          updatedAt: Date.now(),
        },
        {
          rowId: 'row-2',
          resumeId: 'resume-2',
          data: '{"title":"Resume 2"}',
          updatedAt: Date.now(),
        },
      ];

      useUserResumeStore.getState().setResumes(resumes);
      expect(useUserResumeStore.getState().resumeCount).toBe(2);

      useUserResumeStore.getState().deleteResume('resume-1');
      expect(useUserResumeStore.getState().resumeCount).toBe(1);
    });

    it('should maintain count when updating existing resume', () => {
      const resume: HistoryEntry = {
        rowId: 'row-1',
        resumeId: 'resume-1',
        data: '{"title":"Original"}',
        updatedAt: Date.now(),
      };

      useUserResumeStore.getState().addResume(resume);
      const countBefore = useUserResumeStore.getState().resumeCount;

      useUserResumeStore.getState().addResume({
        ...resume,
        data: '{"title":"Updated"}',
      });

      expect(useUserResumeStore.getState().resumeCount).toBe(countBefore);
    });
  });
});
