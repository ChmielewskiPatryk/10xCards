import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// This is a simple test component
const ExampleComponent = ({ text }: { text: string }) => {
  return <div data-testid="example">{text}</div>;
};

describe('Example Component', () => {
  it('renders with the provided text', () => {
    const testText = 'Hello, world!';
    render(<ExampleComponent text={testText} />);
    
    const element = screen.getByTestId('example');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe(testText);
  });

  it('performs a simple calculation correctly', () => {
    expect(2 + 2).toBe(4);
  });
}); 