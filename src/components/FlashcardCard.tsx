import * as React from 'react';
import { Button } from '@/components/ui/button';
import type { Flashcard } from '@/types';

export type FlashcardCardProps = {
  flashcard: Flashcard;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function FlashcardCard({ flashcard, onEdit, onDelete }: FlashcardCardProps) {
  return (
    <div className="border rounded-md p-4 flex flex-col gap-2">
      <div className="font-medium text-lg">{flashcard.front_content}</div>
      <div className="text-gray-600">{flashcard.back_content}</div>
      <div className="text-sm text-gray-500">Źródło: {flashcard.source}</div>
      <div className="text-sm text-gray-500">Utworzono: {new Date(flashcard.created_at).toLocaleDateString()}</div>
      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(flashcard.id)}>Edytuj</Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(flashcard.id)}>Usuń</Button>
      </div>
    </div>
  );
} 