// Base entity types from database schema
import type { Database } from "./db/database.types";

// Common types
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Flashcard types
export type Flashcard = Omit<Database["public"]["Tables"]["flashcards"]["Row"], "user_id">;

export interface CreateFlashcardCommand {
  front_content: string;
  back_content: string;
}

export type UpdateFlashcardCommand = CreateFlashcardCommand;

// Flashcard AI generation types
export interface GenerateFlashcardsCommand {
  source_text: string;
  options?: {
    max_flashcards?: number;
  };
}

export interface FlashcardCandidate {
  front_content: string;
  back_content: string;
  ai_metadata: {
    model: string;
    generation_time: string;
    parameters: Record<string, unknown>;
    modified?: boolean;
    wasEdited?: boolean;
    edited_at?: string;
    original_content?: {
      front_content?: string;
      back_content?: string;
    };
  };
}

export interface GenerateFlashcardsResponse {
  flashcards_proposals: FlashcardCandidate[];
}

export interface ApproveFlashcardsCommand {
  flashcards: FlashcardCandidate[];
}

export interface ApproveFlashcardsResponse {
  approved: Flashcard[];
  count: number;
}

// Study session types
export type StudySession = Omit<Database["public"]["Tables"]["study_sessions"]["Row"], "user_id">;

export type CreateStudySessionResponse = StudySession;

export interface UpdateStudySessionCommand {
  end_time: string;
}

export type StudySessionWithReviews = StudySession & {
  reviews: {
    flashcard_id: string;
    front_content: string;
    back_content: string;
    quality_response: number;
    reviewed_at: string;
  }[];
};

export interface NextFlashcardResponse {
  flashcard: {
    id: string;
    front_content: string;
    back_content: string;
  };
  is_last: boolean;
}

// Flashcard review types
export type FlashcardReview = Database["public"]["Tables"]["flashcard_reviews"]["Row"];

export interface CreateFlashcardReviewCommand {
  study_session_id: string;
  flashcard_id: string;
  quality_response: number;
}

export type CreateFlashcardReviewResponse = FlashcardReview;
