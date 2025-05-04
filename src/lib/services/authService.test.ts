import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, registerUser } from './authService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';

// Mock dla SupabaseClient
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn()
  }
} as unknown as SupabaseClient<Database>;

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should call supabase.auth.signUp with correct parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = { data: { user: { id: 'user-123' } }, error: null };
      (mockSupabaseClient.auth.signUp as any).mockResolvedValue(mockResponse);

      // Act
      const result = await registerUser(mockSupabaseClient, email, password);

      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(result).toEqual(mockResponse);
    });

    it('should return error when registration fails', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = { message: 'Registration failed' };
      const mockResponse = { data: { user: null }, error: mockError };
      (mockSupabaseClient.auth.signUp as any).mockResolvedValue(mockResponse);

      // Act
      const result = await registerUser(mockSupabaseClient, email, password);

      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(result.error).toEqual(mockError);
    });

    it('should handle exceptions from the API', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = new Error('Network error');
      (mockSupabaseClient.auth.signUp as any).mockRejectedValue(mockError);

      // Act & Assert
      await expect(registerUser(mockSupabaseClient, email, password)).rejects.toThrow('Network error');
    });
  });

  describe('loginUser', () => {
    it('should call supabase.auth.signInWithPassword with correct parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = { 
        data: { 
          user: { id: 'user-123' },
          session: { access_token: 'token-123' }
        }, 
        error: null 
      };
      (mockSupabaseClient.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      // Act
      const result = await loginUser(mockSupabaseClient, email, password);

      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result).toEqual(mockResponse);
    });

    it('should return error when login fails', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong-password';
      const mockError = { message: 'Invalid login credentials' };
      const mockResponse = { data: { user: null, session: null }, error: mockError };
      (mockSupabaseClient.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      // Act
      const result = await loginUser(mockSupabaseClient, email, password);

      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result.error).toEqual(mockError);
    });

    it('should handle exceptions from the API', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = new Error('Network error');
      (mockSupabaseClient.auth.signInWithPassword as any).mockRejectedValue(mockError);

      // Act & Assert
      await expect(loginUser(mockSupabaseClient, email, password)).rejects.toThrow('Network error');
    });
  });
}); 