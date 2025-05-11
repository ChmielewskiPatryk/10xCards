import { Button } from "@/components/ui/button";
import type { FlashcardCandidateViewModel } from "./types";
import { Save } from "lucide-react";

interface SaveSelectedFlashcardsButtonProps {
  flashcards: FlashcardCandidateViewModel[];
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function SaveSelectedFlashcardsButton({ flashcards, onSave, isLoading }: SaveSelectedFlashcardsButtonProps) {
  const selectedCount = flashcards.filter((f) => f.isSelected).length;
  const isDisabled = selectedCount === 0 || isLoading;

  return (
    <Button onClick={onSave} disabled={isDisabled} className="relative" data-testid="save-selected-flashcards-button">
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          Zapisywanie...
        </span>
      ) : (
        <span className="flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Zapisz wybrane ({selectedCount})
        </span>
      )}
    </Button>
  );
}
