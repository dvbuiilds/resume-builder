'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getUserResumes,
  refreshUserResumes,
} from '@resume-builder/components/resume-builder/utils/userResumeData';
import { useUserResumeStore } from '../store/userResumeStore';

interface HistoryEntry {
  rowId: string;
  resumeId: string;
  data: string;
  updatedAt: number;
}

interface HistoryContextValue {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setEntries: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(
  undefined,
);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storeResumes = useUserResumeStore((state) => state.resumes);
  const storeLoading = useUserResumeStore((state) => state.isLoading);
  const storeError = useUserResumeStore((state) => state.error);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local state with store
  useEffect(() => {
    setEntries(storeResumes);
    setLoading(storeLoading);
    setError(storeError);
  }, [storeResumes, storeLoading, storeError]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshUserResumes();
      // State will be updated via useEffect when store updates
    } catch (err) {
      const fallbackMessage = 'Something went wrong. Please try again.';
      const message =
        err instanceof Error ? err.message : 'Failed to load past resumes.';
      const finalMessage = /timed out|timeout/i.test(message)
        ? fallbackMessage
        : message || fallbackMessage;
      setError(finalMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load resumes on mount using data layer (checks store first)
    getUserResumes().catch(() => {
      // Silently fail - error will be handled by store
    });
  }, []);

  const value = useMemo(
    () => ({
      entries,
      loading,
      error,
      refresh,
      setEntries,
    }),
    [entries, loading, error, refresh],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export type { HistoryEntry };
