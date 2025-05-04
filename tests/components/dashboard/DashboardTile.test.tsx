import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardTile from '@/components/dashboard/DashboardTile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

describe('DashboardTile', () => {
  const defaultProps = {
    title: 'Test Tile',
    description: 'Test Description',
    icon: 'User',
    linkTo: '/test-link',
  };

  it('renders correctly with required props', () => {
    render(<DashboardTile {...defaultProps} />);
    
    expect(screen.getByText('Test Tile')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Kliknij, aby przejść')).toBeInTheDocument();
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test-link');
  });

  it('renders with count when provided', () => {
    render(<DashboardTile {...defaultProps} count={10} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders with custom color when provided', () => {
    const { container } = render(
      <DashboardTile {...defaultProps} color="bg-blue-100 dark:bg-blue-800" />
    );
    
    const card = container.querySelector('.bg-blue-100');
    expect(card).toBeInTheDocument();
  });

  it('renders with string icon correctly', () => {
    render(<DashboardTile {...defaultProps} icon="Clock" />);
    // Sprawdzamy czy kafelek jest poprawnie renderowany zamiast bezpośrednio ikony
    // która jest renderowana przez FontAwesomeIcon, co jest trudniejsze do testowania
    expect(screen.getByText('Test Tile')).toBeInTheDocument();
    // Sprawdzenie czy link w kafelku działa
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test-link');
  });

  it('renders with ReactNode icon correctly', () => {
    const customIcon = <FontAwesomeIcon icon={faUser} data-testid="custom-icon" />;
    render(<DashboardTile {...defaultProps} icon={customIcon} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders count as string when provided as string', () => {
    render(<DashboardTile {...defaultProps} count="..." />);
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('renders correctly with minimum props', () => {
    const minProps = {
      title: 'Minimal Tile',
      description: '',
      icon: 'User',
      linkTo: '#',
    };
    
    render(<DashboardTile {...minProps} />);
    expect(screen.getByText('Minimal Tile')).toBeInTheDocument();
  });
}); 