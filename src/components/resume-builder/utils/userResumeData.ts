import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';
import { parseErrorMessage } from '@resume-builder/components/resume-builder/utils/parseErrorMessage';
import { useUserResumeStore } from '../store/userResumeStore';
import type { HistoryEntry } from '../context/HistoryContext';

// Consider data stale after 5 minutes
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Checks if the store data is stale or empty
 */
const isStoreDataStale = (): boolean => {
  const state = useUserResumeStore.getState();
  if (state.resumes.length === 0 || !state.lastFetched) {
    return true;
  }
  const age = Date.now() - state.lastFetched;
  return age > STALE_THRESHOLD_MS;
};

/**
 * Fetches user resumes from the API
 */
const fetchResumesFromAPI = async (): Promise<HistoryEntry[]> => {
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
    return payload.data;
  }

  return [];
};

/**
 * Gets user resumes, checking store first and falling back to API if needed
 * Updates the store with fetched data
 */
export const getUserResumes = async (
  forceRefresh = false,
): Promise<HistoryEntry[]> => {
  const store = useUserResumeStore.getState();

  // If not forcing refresh and store has fresh data, return it
  if (!forceRefresh && !isStoreDataStale()) {
    return store.resumes;
  }

  // Otherwise, fetch from API
  store.setLoading(true);
  store.setError(null);

  try {
    const resumes = await fetchResumesFromAPI();
    store.setResumes(resumes);
    return resumes;
  } catch (err) {
    const fallbackMessage = 'Something went wrong. Please try again.';
    const message =
      err instanceof Error ? err.message : 'Failed to load past resumes.';
    const finalMessage = /timed out|timeout/i.test(message)
      ? fallbackMessage
      : message || fallbackMessage;
    store.setError(finalMessage);
    throw new Error(finalMessage);
  } finally {
    store.setLoading(false);
  }
};

/**
 * Explicitly refreshes user resumes from the API
 */
export const refreshUserResumes = async (): Promise<HistoryEntry[]> => {
  return getUserResumes(true);
};
