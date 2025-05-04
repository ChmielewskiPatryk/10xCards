import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogoutButton from '@/components/auth/LogoutButton';

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const originalLocation = window.location;
// @ts-ignore - deliberately ignoring TypeScript errors for testing purposes
window.location = { href: '' };

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.href
    window.location.href = '';
    // Setup default mock for fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true })
    });
  });

  afterAll(() => {
    // @ts-ignore - deliberately ignoring TypeScript errors for testing purposes
    window.location = originalLocation;
  });

  it('renders the logout button', () => {
    render(<LogoutButton />);
    
    expect(screen.getByRole('button')).toHaveTextContent(/wyloguj się/i);
  });

  it('calls fetch with correct parameters when clicked', async () => {
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /wyloguj się/i });
    fireEvent.click(button);
    
    expect(mockFetch).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('shows loading state when logging out', async () => {
    // Mock fetch to not resolve immediately
    mockFetch.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: vi.fn().mockResolvedValue({ success: true })
        });
      }, 100);
    }));
    
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /wyloguj się/i });
    fireEvent.click(button);
    
    // Button should show loading state
    expect(screen.getByRole('button')).toHaveTextContent(/wylogowywanie/i);
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Wait for the async action to complete
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/wyloguj się/i);
    });
  });

  it('redirects to login page on successful logout', async () => {
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /wyloguj się/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(window.location.href).toBe('/auth/login');
    });
  });

  it('handles error when logout fails', async () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Mock fetch to return error response
    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Logout failed' })
    });
    
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /wyloguj się/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Błąd wylogowania');
      expect(window.location.href).not.toBe('/auth/login');
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('applies custom class when provided', () => {
    const customClass = 'custom-button-class';
    render(<LogoutButton className={customClass} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });
}); 