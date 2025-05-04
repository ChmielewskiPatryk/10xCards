import { useState, useCallback } from 'react';

export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerUser = useCallback(async (input: RegisterInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(input),
      });

      const result = await response.json();
      if (!result.success) {
        if (result.errors) {
          const messages = Object.values(result.errors).flat().join(' ');
          setError(messages || 'Błąd rejestracji');
        } else {
          setError(result.error || 'Błąd rejestracji');
        }
        return false;
      }

      return true;
    } catch (err) {
      console.error('Błąd rejestracji:', err);
      setError('Wystąpił błąd podczas rejestracji');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { registerUser, isLoading, error };
} 