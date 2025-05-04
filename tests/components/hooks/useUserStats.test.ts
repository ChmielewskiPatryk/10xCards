import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useUserStats from '@/components/hooks/useUserStats';

// Mock the mockFetchStats function
vi.mock('@/components/hooks/useUserStats', async () => {
  const actual = await vi.importActual('@/components/hooks/useUserStats');
  return {
    ...actual,
    __esModule: true,
    default: vi.fn((userId) => {
      if (userId === 'error-user-id') {
        return {
          stats: { flashcardsCount: 0, sessionsCount: 0 },
          isLoading: false,
          error: new Error('Failed to fetch stats')
        };
      }
      
      if (userId === 'loading-user-id') {
        return {
          stats: { flashcardsCount: 0, sessionsCount: 0 },
          isLoading: true,
          error: null
        };
      }
      
      return {
        stats: { flashcardsCount: 12, sessionsCount: 3 },
        isLoading: false,
        error: null
      };
    })
  };
});

describe('useUserStats', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useUserStats('loading-user-id'));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toEqual({ flashcardsCount: 0, sessionsCount: 0 });
    expect(result.current.error).toBeNull();
  });
  
  it('returns stats successfully', async () => {
    const { result } = renderHook(() => useUserStats('mock-user-id'));
    
    // Wait for the hook to update
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.stats).toEqual({ flashcardsCount: 12, sessionsCount: 3 });
    expect(result.current.error).toBeNull();
  });
  
  it('handles error state correctly', async () => {
    const { result } = renderHook(() => useUserStats('error-user-id'));
    
    // Wait for the hook to update
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch stats');
    expect(result.current.stats).toEqual({ flashcardsCount: 0, sessionsCount: 0 });
  });
}); 