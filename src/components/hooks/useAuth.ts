import { useState, useEffect } from 'react';
import type { User } from '../dashboard/types';

// This will be replaced with actual Supabase auth later
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock user data - this will come from Supabase later
        const mockUser: User = {
          id: 'mock-user-id',
          email: 'user@example.com',
          name: 'Przykładowy Użytkownik',
          createdAt: new Date()
        };
        
        setUser(mockUser);
      } catch (err) {
        console.error('Error checking auth:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const signOut = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear user - this will call Supabase auth.signOut() later
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };
  
  return { user, isLoading, error, signOut };
};

export default useAuth; 