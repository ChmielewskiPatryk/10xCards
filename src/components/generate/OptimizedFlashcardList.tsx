import { useRef, useState, useEffect } from 'react';
import type { FlashcardCandidateViewModel } from './types';
import { FlashcardCandidateItem } from './FlashcardCandidateItem';

type OptimizedFlashcardListProps = {
  flashcards: FlashcardCandidateViewModel[];
  onSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onReject: (index: number) => void;
};

export function OptimizedFlashcardList({
  flashcards,
  onSelect,
  onEdit,
  onReject
}: OptimizedFlashcardListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const itemHeight = 180; // Przybliżona wysokość pojedynczej fiszki w pikselach
  const buffer = 5; // Liczba dodatkowych elementów powyżej i poniżej widocznego obszaru
  
  // Obliczamy potrzebny padding dla zachowania scrollbara
  const topPadding = Math.max(0, visibleRange.start - buffer) * itemHeight;
  const bottomPadding = Math.max(0, flashcards.length - visibleRange.end - buffer) * itemHeight;
  
  // Aktualizacja zakresu widocznych elementów podczas przewijania
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateVisibleRange = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      
      // Obliczenie indeksów pierwszego i ostatniego widocznego elementu
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const end = Math.min(
        flashcards.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + buffer
      );
      
      setVisibleRange({ start, end });
    };
    
    // Inicjalna aktualizacja
    updateVisibleRange();
    
    // Nasłuchiwanie na zdarzenie scroll
    const scrollHandler = () => {
      requestAnimationFrame(updateVisibleRange);
    };
    
    containerRef.current.addEventListener('scroll', scrollHandler);
    
    return () => {
      containerRef.current?.removeEventListener('scroll', scrollHandler);
    };
  }, [flashcards.length, buffer, itemHeight]);
  
  // Określenie, które elementy powinny być renderowane
  const visibleFlashcards = flashcards.slice(
    Math.max(0, visibleRange.start - buffer),
    Math.min(flashcards.length, visibleRange.end + buffer)
  );
  
  return (
    <div 
      ref={containerRef}
      className="h-[600px] overflow-auto"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
        <div className="space-y-4">
          {visibleFlashcards.map((flashcard, relativeIndex) => {
            const absoluteIndex = visibleRange.start - buffer + relativeIndex;
            return (
              <FlashcardCandidateItem
                key={absoluteIndex}
                flashcard={flashcard}
                index={absoluteIndex}
                onSelect={onSelect}
                onEdit={onEdit}
                onReject={onReject}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
} 