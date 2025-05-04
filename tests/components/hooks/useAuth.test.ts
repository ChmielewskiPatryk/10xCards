import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../../src/components/hooks/useAuth';

// Mock Supabase client
vi.mock('../../../src/db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn()
    }
  }
}));

// Mock fetch for logout endpoint
global.fetch = vi.fn();

// Import the mocked module
import { supabaseClient } from '../../../src/db/supabase.client';

describe('useAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock window.location.href for redirect
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });
    
    // Default mock implementations
    (supabaseClient.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: 'mock-user-id', email: 'test@example.com' } } },
      error: null
    });
    
    (supabaseClient.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });
    
    (supabaseClient.auth.signOut as any).mockResolvedValue({ error: null });
    
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ success: true })
    });
  });
  
  it('should return the initial loading state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });
  
  it('should fetch user session on mount', async () => {
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(supabaseClient.auth.getSession).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual({ id: 'mock-user-id', email: 'test@example.com' });
    expect(result.current.error).toBeNull();
  });
  
  it('should handle authentication error', async () => {
    const mockError = new Error('Auth error');
    (supabaseClient.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: mockError
    });
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockError);
  });
  
  it('should setup auth state change listener', async () => {
    renderHook(() => useAuth());
    
    expect(supabaseClient.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
  });
  
  it('should handle sign out correctly', async () => {
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
    
    expect(supabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/auth/login');
  });
  
  it('should handle sign out error from API', async () => {
    const apiError = { success: false, error: 'API error' };
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(apiError)
    });
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    console.error = vi.fn();
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('API error');
    expect(supabaseClient.auth.signOut).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
  
  it('should handle sign out error from Supabase', async () => {
    const supabaseError = new Error('Supabase error');
    (supabaseClient.auth.signOut as any).mockResolvedValue({ error: supabaseError });
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    console.error = vi.fn();
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(result.current.error).toBe(supabaseError);
    expect(console.error).toHaveBeenCalled();
    expect(window.location.href).not.toBe('/auth/login');
  });
}); 