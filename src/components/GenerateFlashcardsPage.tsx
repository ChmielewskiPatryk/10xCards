import { useState, useCallback, memo } from "react";
import { useGenerateFlashcards } from "./hooks/useGenerateFlashcards";
import { SourceTextForm } from "./generate/SourceTextForm";
import { GenerationProgress } from "./generate/GenerationProgress";
import { FlashcardCandidateList } from "./generate/FlashcardCandidateList";
import { SaveSelectedFlashcardsButton } from "./generate/SaveSelectedFlashcardsButton";
import { FlashcardEditForm } from "./generate/FlashcardEditForm";
import { Button } from "./ui/button";
import { toast } from "sonner";
import type { FlashcardCandidate } from "../types";

// Komponent memoizowany dla lepszej wydajności
const MemoizedFlashcardCandidateList = memo(FlashcardCandidateList);
const MemoizedFlashcardEditForm = memo(FlashcardEditForm);

export default function GenerateFlashcardsPage() {
  const {
    formData,
    generationState,
    handleFormSubmit,
    handleCancel,
    handleSelectFlashcard,
    handleEditFlashcard,
    handleSaveEditedFlashcard,
    handleCancelEdit,
    handleRejectFlashcard,
    handleSaveSelectedFlashcards,
  } = useGenerateFlashcards();

  const [editingFlashcardIndex, setEditingFlashcardIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Używamy useCallback dla funkcji przekazywanych jako props do memoizowanych komponentów
  const onEditFlashcard = useCallback(
    (index: number) => {
      handleEditFlashcard(index);
      setEditingFlashcardIndex(index);
    },
    [handleEditFlashcard]
  );

  const onSaveEditedFlashcard = useCallback(
    (updatedFlashcard: FlashcardCandidate) => {
      if (editingFlashcardIndex !== null) {
        handleSaveEditedFlashcard(editingFlashcardIndex, updatedFlashcard);
        setEditingFlashcardIndex(null);
      }
    },
    [editingFlashcardIndex, handleSaveEditedFlashcard]
  );

  const onCancelEdit = useCallback(() => {
    if (editingFlashcardIndex !== null) {
      handleCancelEdit(editingFlashcardIndex);
      setEditingFlashcardIndex(null);
    }
  }, [editingFlashcardIndex, handleCancelEdit]);

  const onSaveSelectedFlashcards = useCallback(async () => {
    try {
      setIsSaving(true);
      const result = await handleSaveSelectedFlashcards();
      if (result) {
        toast.success(`Zapisano ${result.count} fiszek pomyślnie!`);
      } else {
        toast.error("Nie udało się zapisać fiszek.");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas zapisywania fiszek.");
    } finally {
      setIsSaving(false);
    }
  }, [handleSaveSelectedFlashcards]);

  // Memoizujemy resetState dla optymalizacji
  const resetState = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  return (
    <div className="flex flex-col gap-6">
      {/* Initial form view when no flashcards are generated yet */}
      {generationState.status === "idle" && <SourceTextForm onSubmit={handleFormSubmit} isLoading={false} />}

      {/* Loading state with progress indicator */}
      {generationState.status === "loading" && (
        <div className="space-y-4">
          <GenerationProgress
            onCancel={handleCancel}
            startTime={generationState.startTime || Date.now()}
            timeout={120000}
          />
        </div>
      )}

      {/* Error state */}
      {generationState.status === "error" && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Błąd generowania</h3>
          <p className="text-red-700">{generationState.error}</p>
          <Button onClick={resetState} className="mt-4" variant="outline">
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {/* Success state with generated flashcards */}
      {generationState.status === "success" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Wygenerowane propozycje ({generationState.flashcards.length})</h2>
            <div className="flex gap-2">
              <Button onClick={resetState} variant="outline">
                Wróć
              </Button>
              <SaveSelectedFlashcardsButton
                flashcards={generationState.flashcards}
                onSave={onSaveSelectedFlashcards}
                isLoading={isSaving}
              />
            </div>
          </div>

          <MemoizedFlashcardCandidateList
            flashcards={generationState.flashcards}
            onSelect={handleSelectFlashcard}
            onEdit={onEditFlashcard}
            onReject={handleRejectFlashcard}
          />
        </div>
      )}

      {/* Edit modal dialog */}
      {editingFlashcardIndex !== null && generationState.flashcards[editingFlashcardIndex] && (
        <MemoizedFlashcardEditForm
          flashcard={generationState.flashcards[editingFlashcardIndex]}
          onSave={onSaveEditedFlashcard}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  );
}
