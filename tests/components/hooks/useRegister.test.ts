import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRegister } from '../../../src/components/hooks/useRegister';
import type { RegisterInput } from '../../../src/components/hooks/useRegister';

// Mock fetch API
global.fetch = vi.fn();

describe('useRegister', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    console.error = vi.fn();
  });
  
  const mockRegisterInput: RegisterInput = {
    email: 'test@example.com',
    password: 'securePassword123',
    confirmPassword: 'securePassword123'
  };
  
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRegister());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.registerUser).toBe('function');
  });
  
  it('should handle successful registration', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true })
    });
    
    const { result } = renderHook(() => useRegister());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.registerUser(mockRegisterInput);
    });
    
    expect(success).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(mockRegisterInput)
    });
  });
  
  it('should handle registration error with error message', async () => {
    const errorMessage = 'Email already exists';
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: false, error: errorMessage })
    });
    
    const { result } = renderHook(() => useRegister());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.registerUser(mockRegisterInput);
    });
    
    expect(success).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });
  
  it('should handle registration error with validation errors', async () => {
    const validationErrors = {
      email: ['Invalid email format'],
      password: ['Password too short']
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ 
        success: false, 
        errors: validationErrors
      })
    });
    
    const { result } = renderHook(() => useRegister());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.registerUser(mockRegisterInput);
    });
    
    expect(success).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Invalid email format Password too short');
  });
  
  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useRegister());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.registerUser(mockRegisterInput);
    });
    
    expect(success).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Wystąpił błąd podczas rejestracji');
    expect(console.error).toHaveBeenCalledWith(
      'Błąd rejestracji:', 
      expect.any(Error)
    );
  });
  
  it('should set loading state during registration process', async () => {
    // Create a delayed promise to check loading state
    let resolvePromise: (value: any) => void;
    const responsePromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    (global.fetch as any).mockImplementationOnce(() => {
      return Promise.resolve({
        json: () => responsePromise
      });
    });
    
    const { result } = renderHook(() => useRegister());
    
    // Start the registration process without awaiting completion
    const registerPromise = result.current.registerUser(mockRegisterInput);
    
    // Need to wait a tick for React to process the state update
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
    
    // Now resolve the response
    await act(async () => {
      resolvePromise!({ success: true });
      await registerPromise;
    });
    
    // Check that loading state is reset after completion
    expect(result.current.isLoading).toBe(false);
  });
}); 