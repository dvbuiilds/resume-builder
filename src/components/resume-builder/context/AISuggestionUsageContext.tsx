'use client';

import {
  type FC,
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

interface AISuggestionUsageContextType {
  usageCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AISuggestionUsageContext = createContext<
  AISuggestionUsageContextType | undefined
>(undefined);

export const AISuggestionUsageProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/ai-suggestions');

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, set usage to 0
          setUsageCount(0);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch usage');
      }

      const data = await response.json();
      setUsageCount(data.usageCount || 0);
    } catch (err) {
      console.error('Error fetching AI suggestion usage:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // On error, assume usage is 0 to allow attempts
      setUsageCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return (
    <AISuggestionUsageContext.Provider
      value={{
        usageCount,
        isLoading,
        error,
        refetch: fetchUsage,
      }}
    >
      {children}
    </AISuggestionUsageContext.Provider>
  );
};

export const useAISuggestionUsageContext = () => {
  const context = useContext(AISuggestionUsageContext);
  if (context === undefined) {
    throw new Error(
      'useAISuggestionUsageContext must be used within AISuggestionUsageProvider',
    );
  }
  return context;
};
