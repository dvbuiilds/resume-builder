'use client';

import fetchWithTimeout from 'downloader/utils/fetchWithTimeout';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { parseErrorMessage } from '@/components/resume-builder/utils/parseErrorMessage';

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
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout(
        '/api/past-resumes',
        {
          credentials: 'include',
        },
        2000,
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message || 'Failed to load past resumes.');
      }

      const payload = (await response.json()) as {
        data?: HistoryEntry[];
      };

      if (Array.isArray(payload?.data)) {
        setEntries(payload.data);
      } else {
        setEntries([]);
      }
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
    refresh().catch(() => undefined);
  }, [refresh]);

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
