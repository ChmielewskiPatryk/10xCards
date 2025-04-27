import { useState } from 'react';
import type { 
  FlashcardCandidate,
  GenerateFlashcardsResponse, 
  ApproveFlashcardsResponse 
} from '../../types';
import type {
  FlashcardCandidateViewModel,
  GenerationState,
  GenerateFlashcardsFormData
} from '../generate/types';

export const useGenerateFlashcards = () => {
  // Form state
  const [formData, setFormData] = useState<GenerateFlashcardsFormData>({
    source_text: '',
    options: {
      max_flashcards: 10
    }
  });

  // Generation state
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'idle',
    flashcards: [],
    error: null,
    startTime: null
  });

  // Reset state
  const resetState = () => {
    setGenerationState({
      status: 'idle',
      flashcards: [],
      error: null,
      startTime: null
    });
  };

  // Handle form submission
  const handleFormSubmit = async (data: GenerateFlashcardsFormData) => {
    try {
      setFormData(data);
      setGenerationState({
        status: 'loading',
        flashcards: [],
        error: null,
        startTime: Date.now()
      });

      // API call with 2-minute timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się wygenerować fiszek');
      }
      
      const responseData: GenerateFlashcardsResponse = await response.json();
      
      // Transform response to view model
      const flashcardsViewModel = responseData.flashcards_proposals.map(flashcard => ({
        ...flashcard,
        isSelected: false,
        isEditing: false,
        wasEdited: false
      }));
      
      setGenerationState({
        status: 'success',
        flashcards: flashcardsViewModel,
        error: null,
        startTime: null
      });
    } catch (error) {
      setGenerationState({
        status: 'error',
        flashcards: [],
        error: error instanceof Error ? error.message : 'Nieznany błąd',
        startTime: null
      });
    }
  };

  // Cancel generation
  const handleCancel = () => {
    resetState();
  };

  // Select/deselect flashcard
  const handleSelectFlashcard = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((flashcard, i) => 
        i === index ? { ...flashcard, isSelected: !flashcard.isSelected } : flashcard
      )
    }));
  };

  // Edit flashcard
  const handleEditFlashcard = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((flashcard, i) => 
        i === index ? { ...flashcard, isEditing: true } : flashcard
      )
    }));
  };

  // Save edited flashcard
  const handleSaveEditedFlashcard = (index: number, updatedFlashcard: FlashcardCandidate) => {
    setGenerationState(prev => {
      const originalFlashcard = prev.flashcards[index];
      
      // Ensure the ai_metadata includes the original content for source tracking
      const enhancedMetadata = {
        ...updatedFlashcard.ai_metadata,
        original_content: {
          front_content: originalFlashcard.front_content,
          back_content: originalFlashcard.back_content
        },
        edited_at: new Date().toISOString(),
        modified: true
      };
      
      return {
        ...prev,
        flashcards: prev.flashcards.map((flashcard, i) => 
          i === index ? { 
            ...flashcard, 
            front_content: updatedFlashcard.front_content,
            back_content: updatedFlashcard.back_content,
            ai_metadata: enhancedMetadata,
            isEditing: false,
            wasEdited: true,
            isSelected: true // Automatically select edited flashcard
          } : flashcard
        )
      };
    });
  };

  // Cancel flashcard edit
  const handleCancelEdit = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((flashcard, i) => 
        i === index ? { ...flashcard, isEditing: false } : flashcard
      )
    }));
  };

  // Reject flashcard
  const handleRejectFlashcard = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.filter((_, i) => i !== index)
    }));
  };

  // Save selected flashcards
  const handleSaveSelectedFlashcards = async () => {
    try {
      // Filter and prepare selected flashcards
      const selectedFlashcards = generationState.flashcards
        .filter(flashcard => flashcard.isSelected)
        .map(flashcard => {
          // Destructure the flashcard properties
          const { isSelected, isEditing, wasEdited, front_content, back_content, ai_metadata } = flashcard;
          
          // Create a modified version of the ai_metadata with proper flags set
          const updatedAiMetadata = {
            ...ai_metadata,
            wasEdited: wasEdited, // Explicitly set wasEdited flag in metadata
            modified: wasEdited, // Legacy flag for backward compatibility
            edited_at: wasEdited ? new Date().toISOString() : undefined
          };
          
          // Return an extended flashcard object with wasEdited explicitly set
          // This will be caught by the type conversion, but will be visible for debugging
          const savedFlashcard = {
            front_content,
            back_content,
            ai_metadata: updatedAiMetadata,
            wasEdited // Explicitly include wasEdited as a direct property
          };
          
          return savedFlashcard;
        });
      
      if (selectedFlashcards.length === 0) {
        throw new Error('Nie wybrano żadnych fiszek do zapisania');
      }
      
      const response = await fetch('/api/flashcards/saveFlashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards: selectedFlashcards })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się zapisać fiszek');
      }
      
      const responseData: ApproveFlashcardsResponse = await response.json();
      
      // Reset state after successful save
      resetState();
      
      return responseData;
    } catch (error) {
      return null;
    }
  };

  return {
    formData,
    generationState,
    handleFormSubmit,
    handleCancel,
    handleSelectFlashcard,
    handleEditFlashcard,
    handleSaveEditedFlashcard,
    handleCancelEdit,
    handleRejectFlashcard,
    handleSaveSelectedFlashcards
  };
}; 