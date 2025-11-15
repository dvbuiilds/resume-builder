'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useUserResumeSync } from '@resume-builder/components/resume-builder/hooks/useUserResumeSync';

function SessionSyncWrapper({ children }: { children: React.ReactNode }) {
  useUserResumeSync();
  return <>{children}</>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SessionSyncWrapper>{children}</SessionSyncWrapper>
    </NextAuthSessionProvider>
  );
}
