import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getUserResumes } from '../utils/userResumeData';
import { useUserResumeStore } from '../store/userResumeStore';

/**
 * Hook that monitors session status and syncs user resume data
 * - On authentication: populates store with user resumes
 * - On session restore: refreshes store if needed
 * - On logout: clears store
 */
export const useUserResumeSync = () => {
  const { status, data: session } = useSession();
  const hasInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const store = useUserResumeStore.getState();
    const currentUserId = session?.user?.id || null;

    // Handle logout: clear store when user logs out
    if (status === 'unauthenticated') {
      if (lastUserId.current !== null) {
        // User was logged in before, now logged out
        store.clearResumes();
        lastUserId.current = null;
        hasInitialized.current = false;
      }
      return;
    }

    // Handle authentication: populate store when user logs in
    if (status === 'authenticated' && currentUserId) {
      // If this is a new user (different from last), reset initialization
      if (lastUserId.current !== currentUserId) {
        hasInitialized.current = false;
        lastUserId.current = currentUserId;
      }

      // Populate store on first authentication or when user changes
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        getUserResumes().catch((err) => {
          console.warn('Failed to load user resumes on sync:', err);
        });
      }
    }
  }, [status, session?.user?.id]);
};
