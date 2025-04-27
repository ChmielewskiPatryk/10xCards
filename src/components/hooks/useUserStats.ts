import { useState, useEffect } from 'react';

interface UserStats {
  flashcardsCount: number;
  sessionsCount: number;
}

// This will be replaced with actual Supabase integration later
const mockFetchStats = async (userId: string): Promise<UserStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return {
    flashcardsCount: 12,
    sessionsCount: 3
  };
};

export const useUserStats = (userId: string) => {
  const [stats, setStats] = useState<UserStats>({
    flashcardsCount: 0,
    sessionsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await mockFetchStats(userId);
        setStats(data);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [userId]);
  
  return { stats, isLoading, error };
};

export default useUserStats; 