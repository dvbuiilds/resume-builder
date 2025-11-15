import { useState, useEffect } from 'react';

interface AISuggestionUsageResponse {
  usageCount: number;
  maxUsage: number;
}

export const useAISuggestionUsage = () => {
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

      const data: AISuggestionUsageResponse = await response.json();
      setUsageCount(data.usageCount);
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

  return {
    usageCount,
    isLoading,
    error,
    refetch: fetchUsage,
  };
};
