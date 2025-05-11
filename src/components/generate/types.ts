import type { FlashcardCandidate } from "../../types";

// Definicje typów dla komponentów generowania fiszek
export type FlashcardCandidateViewModel = FlashcardCandidate & {
  isSelected: boolean;
  isEditing: boolean;
  wasEdited: boolean;
};

export interface GenerationState {
  status: "idle" | "loading" | "success" | "error";
  flashcards: FlashcardCandidateViewModel[];
  error: string | null;
  startTime: number | null;
}

export interface GenerateFlashcardsFormData {
  source_text: string;
  options: {
    max_flashcards: number;
  };
}
