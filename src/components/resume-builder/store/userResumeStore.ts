import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { HistoryEntry } from '../context/HistoryContext';

interface UserResumeState {
  resumes: HistoryEntry[];
  resumeCount: number;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setResumes: (resumes: HistoryEntry[]) => void;
  addResume: (resume: HistoryEntry) => void;
  updateResume: (resumeId: string, data: string, updatedAt: number) => void;
  deleteResume: (resumeId: string) => void;
  clearResumes: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const dualStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (name: string) =>
      window.localStorage.getItem(name) ?? window.sessionStorage.getItem(name),
    setItem: (name: string, value: string) => {
      window.localStorage.setItem(name, value);
      window.sessionStorage.setItem(name, value);
    },
    removeItem: (name: string) => {
      window.localStorage.removeItem(name);
      window.sessionStorage.removeItem(name);
    },
  };
});

export const useUserResumeStore = create<UserResumeState>()(
  persist(
    (set) => ({
      // Initial state
      resumes: [],
      resumeCount: 0,
      lastFetched: null,
      isLoading: false,
      error: null,

      // Actions
      setResumes: (resumes) =>
        set({
          resumes,
          resumeCount: resumes.length,
          lastFetched: Date.now(),
          error: null,
        }),

      addResume: (resume) =>
        set((state) => {
          // Check if resume already exists (by resumeId)
          const exists = state.resumes.some(
            (r) => r.resumeId === resume.resumeId,
          );
          if (exists) {
            // Update existing resume instead of adding duplicate
            return {
              resumes: state.resumes.map((r) =>
                r.resumeId === resume.resumeId ? resume : r,
              ),
              resumeCount: state.resumes.length,
              lastFetched: Date.now(),
            };
          }
          return {
            resumes: [...state.resumes, resume],
            resumeCount: state.resumes.length + 1,
            lastFetched: Date.now(),
          };
        }),

      updateResume: (resumeId, data, updatedAt) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.resumeId === resumeId ? { ...r, data, updatedAt } : r,
          ),
          lastFetched: Date.now(),
        })),

      deleteResume: (resumeId) =>
        set((state) => ({
          resumes: state.resumes.filter((r) => r.resumeId !== resumeId),
          resumeCount: Math.max(0, state.resumes.length - 1),
          lastFetched: Date.now(),
        })),

      clearResumes: () =>
        set({
          resumes: [],
          resumeCount: 0,
          lastFetched: null,
          error: null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'user-resume-store',
      storage: dualStorage,
      partialize: (state) => ({
        resumes: state.resumes,
        resumeCount: state.resumeCount,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
