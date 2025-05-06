import { useMemo } from 'react';
import { FlashcardCandidateItem } from './FlashcardCandidateItem';
import { OptimizedFlashcardList } from './OptimizedFlashcardList';
import type { FlashcardCandidateViewModel } from './types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Próg, po którym włączamy zoptymalizowane renderowanie
const OPTIMIZATION_THRESHOLD = 15; 

type FlashcardCandidateListProps = {
  flashcards: FlashcardCandidateViewModel[];
  onSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onReject: (index: number) => void;
};

export function FlashcardCandidateList({
  flashcards,
  onSelect,
  onEdit,
  onReject
}: FlashcardCandidateListProps) {
  // Liczba wybranych fiszek
  const selectedCount = useMemo(() => 
    flashcards.filter(f => f.isSelected).length, 
    [flashcards]
  );

  // Czy lista jest pusta
  if (flashcards.length === 0) {
    return (
      <Alert variant="destructive" data-testid="flashcards-empty-alert">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          Nie znaleziono propozycji fiszek. Spróbuj ponownie z innym tekstem.
        </AlertDescription>
      </Alert>
    );
  }

  // Czy potrzebujemy optymalizacji
  const needsOptimization = flashcards.length > OPTIMIZATION_THRESHOLD;

  return (
    <div className="space-y-5" data-testid="flashcards-candidate-list">
      <div className="text-sm text-muted-foreground" data-testid="flashcards-selected-count">
        Wybrano {selectedCount} z {flashcards.length} fiszek
      </div>
      
      {needsOptimization ? (
        // Zoptymalizowana lista dla dużej liczby fiszek
        <OptimizedFlashcardList
          flashcards={flashcards}
          onSelect={onSelect}
          onEdit={onEdit}
          onReject={onReject}
          data-testid="optimized-flashcards-list"
        />
      ) : (
        // Standardowa lista dla małej liczby fiszek
        <div className="space-y-4" data-testid="standard-flashcards-list">
          {flashcards.map((flashcard, index) => (
            <FlashcardCandidateItem
              key={index}
              flashcard={flashcard}
              index={index}
              onSelect={onSelect}
              onEdit={onEdit}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
} 