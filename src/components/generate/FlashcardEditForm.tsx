import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FlashcardCandidateViewModel } from "./types";
import type { FlashcardCandidate } from "../../types";
import { AlertCircle } from "lucide-react";

interface FlashcardEditFormProps {
  flashcard: FlashcardCandidateViewModel;
  onSave: (updatedFlashcard: FlashcardCandidate) => void;
  onCancel: () => void;
}

export function FlashcardEditForm({ flashcard, onSave, onCancel }: FlashcardEditFormProps) {
  const [frontContent, setFrontContent] = useState(flashcard.front_content);
  const [backContent, setBackContent] = useState(flashcard.back_content);
  const [errors, setErrors] = useState<{
    frontContent?: string;
    backContent?: string;
  }>({});

  // Form validation
  const validate = () => {
    const newErrors: {
      frontContent?: string;
      backContent?: string;
    } = {};

    if (!frontContent.trim()) {
      newErrors.frontContent = "Treść przodu fiszki nie może być pusta";
    }

    if (!backContent.trim()) {
      newErrors.backContent = "Treść tyłu fiszki nie może być pusta";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validate()) {
      // Store the original content in ai_metadata for tracking modifications
      const updatedAiMetadata = {
        ...flashcard.ai_metadata,
        original_content: {
          front_content: flashcard.front_content,
          back_content: flashcard.back_content,
        },
      };

      onSave({
        front_content: frontContent,
        back_content: backContent,
        ai_metadata: updatedAiMetadata,
      });
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-[600px] h-fit max-h-[90vh] flex flex-col" data-testid="edit-flashcard-dialog">
        <DialogHeader>
          <DialogTitle>Edycja fiszki</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frontContent">
              Przód fiszki (pytanie)
              <span className="text-red-500">*</span>
            </Label>

            <div className="relative h-24">
              <Textarea
                id="frontContent"
                value={frontContent}
                onChange={(e) => setFrontContent(e.target.value)}
                placeholder="Wprowadź treść przodu fiszki"
                className="absolute inset-0 resize-none"
                aria-invalid={!!errors.frontContent}
                aria-describedby="frontContent-error"
                data-testid="edit-front-content"
              />
            </div>

            {errors.frontContent && (
              <div
                className="flex items-center text-red-500 text-sm"
                id="frontContent-error"
                data-testid="front-content-error"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.frontContent}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="backContent">
              Tył fiszki (odpowiedź)
              <span className="text-red-500">*</span>
            </Label>

            <div className="relative h-32">
              <Textarea
                id="backContent"
                value={backContent}
                onChange={(e) => setBackContent(e.target.value)}
                placeholder="Wprowadź treść tyłu fiszki"
                className="absolute inset-0 resize-none"
                aria-invalid={!!errors.backContent}
                aria-describedby="backContent-error"
                data-testid="edit-back-content"
              />
            </div>

            {errors.backContent && (
              <div
                className="flex items-center text-red-500 text-sm"
                id="backContent-error"
                data-testid="back-content-error"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.backContent}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} data-testid="edit-cancel-button">
            Anuluj
          </Button>
          <Button onClick={handleSave} data-testid="edit-save-button">
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
