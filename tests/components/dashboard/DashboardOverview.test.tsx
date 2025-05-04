import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, getAllByText } from '@testing-library/react';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import useUserStats from '@/components/hooks/useUserStats';

// Mock useUserStats hook
vi.mock('@/components/hooks/useUserStats', () => ({
  __esModule: true,
  default: vi.fn()
}));

// Mock DashboardTile component
vi.mock('@/components/dashboard/DashboardTile', () => ({
  __esModule: true,
  default: vi.fn(({ title, description, icon, linkTo, count, color }) => (
    <div data-testid="dashboard-tile">
      <h3>{title}</h3>
      <p>{description}</p>
      <span>Count: {count}</span>
      <a href={linkTo}>Link</a>
    </div>
  ))
}));

describe('DashboardOverview', () => {
  const mockTiles = [
    {
      title: 'Moje fiszki',
      description: 'Wszystkie twoje fiszki',
      icon: 'Cards',
      linkTo: '/flashcards',
      color: 'bg-blue-100'
    },
    {
      title: 'Sesje powtórek',
      description: 'Historia twoich sesji',
      icon: 'Clock',
      linkTo: '/sessions',
      color: 'bg-green-100'
    },
    {
      title: 'Ustawienia',
      description: 'Konfiguracja konta',
      icon: 'Settings',
      linkTo: '/settings',
      color: 'bg-purple-100'
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state correctly', () => {
    // Mock hook to return loading state
    (useUserStats as any).mockReturnValue({
      stats: { flashcardsCount: 0, sessionsCount: 0 },
      isLoading: true,
      error: null
    });

    render(<DashboardOverview tiles={mockTiles} />);
    
    // Check if tiles are displayed with loading indicator
    const tiles = screen.getAllByTestId('dashboard-tile');
    expect(tiles).toHaveLength(3);
    
    // Check if loading indicators are shown for stat tiles
    expect(screen.getByText('Moje fiszki')).toBeInTheDocument();
    // Użyj getAllByText zamiast getByText aby sprawdzić elementy z tymi samymi tekstami
    const loadingElements = screen.getAllByText(/Count: \.\.\./i);
    expect(loadingElements.length).toBe(2);
  });

  it('renders error state correctly', () => {
    // Mock hook to return error state
    (useUserStats as any).mockReturnValue({
      stats: { flashcardsCount: 0, sessionsCount: 0 },
      isLoading: false,
      error: new Error('Failed to load stats')
    });

    render(<DashboardOverview tiles={mockTiles} />);
    
    // Check if error message is displayed
    expect(screen.getByText(/wystąpił błąd podczas ładowania statystyk/i)).toBeInTheDocument();
    
    // Check if tiles show error indicators
    const errorElements = screen.getAllByText('Count: !');
    expect(errorElements.length).toBe(2);
  });

  it('renders successful state with stats correctly', () => {
    // Mock hook to return successful state with stats
    (useUserStats as any).mockReturnValue({
      stats: { flashcardsCount: 42, sessionsCount: 7 },
      isLoading: false,
      error: null
    });

    render(<DashboardOverview tiles={mockTiles} />);
    
    // Check if tiles are displayed with correct stats
    const tiles = screen.getAllByTestId('dashboard-tile');
    expect(tiles).toHaveLength(3);
    
    // Verify specific tiles have correct counts
    expect(screen.getByText('Moje fiszki')).toBeInTheDocument();
    expect(screen.getByText('Count: 42')).toBeInTheDocument();
    
    expect(screen.getByText('Sesje powtórek')).toBeInTheDocument();
    expect(screen.getByText('Count: 7')).toBeInTheDocument();
  });

  it('preserves other tile properties that are not stats-related', () => {
    // Mock hook to return successful state with stats
    (useUserStats as any).mockReturnValue({
      stats: { flashcardsCount: 10, sessionsCount: 5 },
      isLoading: false,
      error: null
    });

    render(<DashboardOverview tiles={mockTiles} />);
    
    // Check if third tile (which doesn't have stats) is rendered correctly
    expect(screen.getByText('Ustawienia')).toBeInTheDocument();
    expect(screen.getByText('Konfiguracja konta')).toBeInTheDocument();
  });
}); 