// Base entity types from database schema
import type { Database } from './db/database.types';

// Common types
export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

// Flashcard types
export type Flashcard = Omit<Database['public']['Tables']['flashcards']['Row'], 'user_id'>;

export type CreateFlashcardCommand = {
  front_content: string;
  back_content: string;
};

export type UpdateFlashcardCommand = CreateFlashcardCommand;

// Flashcard AI generation types
export type GenerateFlashcardsCommand = {
  source_text: string;
  options?: {
    max_flashcards?: number;
  };
};

export type FlashcardCandidate = {
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
};

export type GenerateFlashcardsResponse = {
  flashcards_proposals: FlashcardCandidate[];
};

export type ApproveFlashcardsCommand = {
  flashcards: FlashcardCandidate[];
};

export type ApproveFlashcardsResponse = {
  approved: Flashcard[];
  count: number;
};

// Study session types
export type StudySession = Omit<Database['public']['Tables']['study_sessions']['Row'], 'user_id'>;

export type CreateStudySessionResponse = StudySession;

export type UpdateStudySessionCommand = {
  end_time: string;
};

export type StudySessionWithReviews = StudySession & {
  reviews: Array<{
    flashcard_id: string;
    front_content: string;
    back_content: string;
    quality_response: number;
    reviewed_at: string;
  }>;
};

export type NextFlashcardResponse = {
  flashcard: {
    id: string;
    front_content: string;
    back_content: string;
  };
  is_last: boolean;
};

// Flashcard review types
export type FlashcardReview = Database['public']['Tables']['flashcard_reviews']['Row'];

export type CreateFlashcardReviewCommand = {
  study_session_id: string;
  flashcard_id: string;
  quality_response: number;
};

export type CreateFlashcardReviewResponse = FlashcardReview; 