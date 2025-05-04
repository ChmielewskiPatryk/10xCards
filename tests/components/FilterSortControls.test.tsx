import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSortControls } from '@/components/FilterSortControls';

describe('FilterSortControls', () => {
  const defaultProps = {
    source: 'all' as const,
    sort: 'created_at' as const,
    order: 'desc' as const,
    onSourceChange: vi.fn(),
    onSortChange: vi.fn(),
    onOrderChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all controls correctly', () => {
    render(<FilterSortControls {...defaultProps} />);
    
    // Check if source filter exists
    expect(screen.getByLabelText(/źródło/i)).toBeInTheDocument();
    
    // Check if sort options exist
    expect(screen.getByLabelText(/sortuj według/i)).toBeInTheDocument();
    
    // Check if order options exist
    expect(screen.getByLabelText(/kolejność/i)).toBeInTheDocument();
  });

  it('displays current values in controls', () => {
    render(
      <FilterSortControls
        source="manual"
        sort="updated_at"
        order="asc"
        onSourceChange={defaultProps.onSourceChange}
        onSortChange={defaultProps.onSortChange}
        onOrderChange={defaultProps.onOrderChange}
      />
    );
    
    // Check if the source select has the correct value
    const sourceSelect = screen.getByLabelText(/źródło/i) as HTMLSelectElement;
    expect(sourceSelect.value).toBe('manual');
    
    // Check if the sort select has the correct value
    const sortSelect = screen.getByLabelText(/sortuj według/i) as HTMLSelectElement;
    expect(sortSelect.value).toBe('updated_at');
    
    // Check if the order select has the correct value
    const orderSelect = screen.getByLabelText(/kolejność/i) as HTMLSelectElement;
    expect(orderSelect.value).toBe('asc');
  });

  it('calls onSourceChange when source filter is changed', () => {
    render(<FilterSortControls {...defaultProps} />);
    
    const sourceSelect = screen.getByLabelText(/źródło/i);
    fireEvent.change(sourceSelect, { target: { value: 'ai' } });
    
    expect(defaultProps.onSourceChange).toHaveBeenCalledWith('ai');
  });

  it('calls onSortChange when sort option is changed', () => {
    render(<FilterSortControls {...defaultProps} />);
    
    const sortSelect = screen.getByLabelText(/sortuj według/i);
    fireEvent.change(sortSelect, { target: { value: 'updated_at' } });
    
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('updated_at');
  });

  it('calls onOrderChange when order option is changed', () => {
    render(<FilterSortControls {...defaultProps} />);
    
    const orderSelect = screen.getByLabelText(/kolejność/i);
    fireEvent.change(orderSelect, { target: { value: 'asc' } });
    
    expect(defaultProps.onOrderChange).toHaveBeenCalledWith('asc');
  });

  it('hides all option in source filter when hideAllOption is true', () => {
    render(<FilterSortControls {...defaultProps} hideAllOption={true} />);
    
    const sourceSelect = screen.getByLabelText(/źródło/i);
    const options = Array.from(sourceSelect.querySelectorAll('option'));
    
    // Check that "all" option is not present
    expect(options.find(option => option.value === 'all')).toBeUndefined();
  });
}); 