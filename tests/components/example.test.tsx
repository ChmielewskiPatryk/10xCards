import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// Example component to test
const Counter = ({ onIncrement }: { onIncrement?: () => void }) => {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);
    onIncrement?.();
  };
  
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

describe('Counter component', () => {
  it('renders the initial count', () => {
    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
  
  it('increments the count when button is clicked', async () => {
    render(<Counter />);
    
    const button = screen.getByRole('button', { name: 'Increment' });
    await userEvent.click(button);
    
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
  
  it('calls the onIncrement callback when button is clicked', async () => {
    // Create a mock function
    const mockIncrement = vi.fn();
    
    render(<Counter onIncrement={mockIncrement} />);
    
    const button = screen.getByRole('button', { name: 'Increment' });
    await userEvent.click(button);
    
    // Verify the mock was called
    expect(mockIncrement).toHaveBeenCalledTimes(1);
  });
  
  it('demonstrates a snapshot', () => {
    const { container } = render(<Counter />);
    expect(container).toMatchSnapshot();
  });
}); 