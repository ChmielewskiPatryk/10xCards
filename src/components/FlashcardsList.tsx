import * as React from 'react';
import type { Flashcard } from '@/types';
import { FlashcardCard } from '@/components/FlashcardCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export type FlashcardsListProps = {
  items: Flashcard[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function FlashcardsList({ items, loading, onEdit, onDelete }: FlashcardsListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!items.length) {
    return <p className="text-center py-8 text-gray-500 dark:text-gray-400">Brak fiszek</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((fc) => (
        <FlashcardCard key={fc.id} flashcard={fc} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
} 