import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashcardsList } from '@/components/FlashcardsList';
import type { Flashcard } from '@/types';

// Mock FlashcardCard component to simplify testing
vi.mock('@/components/FlashcardCard', () => ({
  FlashcardCard: ({ 
    flashcard, 
    onEdit, 
    onDelete 
  }: { 
    flashcard: Flashcard; 
    onEdit: (id: string) => void; 
    onDelete: (id: string) => void 
  }) => (
    <div data-testid={`flashcard-${flashcard.id}`}>
      <div>{flashcard.front_content}</div>
      <button onClick={() => onEdit(flashcard.id)}>Edit</button>
      <button onClick={() => onDelete(flashcard.id)}>Delete</button>
    </div>
  )
}));

// Mock LoadingSpinner component
vi.mock('@/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" role="status">Loading...</div>
}));

describe('FlashcardsList', () => {
  const mockFlashcards: Flashcard[] = [
    {
      id: '1',
      front_content: 'Pytanie 1',
      back_content: 'Odpowiedź 1',
      source: 'manual',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      ai_metadata: null
    },
    {
      id: '2',
      front_content: 'Pytanie 2',
      back_content: 'Odpowiedź 2',
      source: 'ai',
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      ai_metadata: { model: 'test-model' }
    }
  ];

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders loading spinner when loading is true', () => {
    render(<FlashcardsList items={[]} loading={true} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId(/flashcard-/)).not.toBeInTheDocument();
  });

  it('renders empty state when no items and not loading', () => {
    render(<FlashcardsList items={[]} loading={false} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} />);
    
    expect(screen.getByText(/Brak fiszek/i)).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('renders flashcards when items are provided', () => {
    render(<FlashcardsList items={mockFlashcards} loading={false} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} />);
    
    expect(screen.getByTestId('flashcard-1')).toBeInTheDocument();
    expect(screen.getByTestId('flashcard-2')).toBeInTheDocument();
    expect(screen.getByText('Pytanie 1')).toBeInTheDocument();
    expect(screen.getByText('Pytanie 2')).toBeInTheDocument();
  });
}); 