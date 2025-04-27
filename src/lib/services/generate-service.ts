import { z } from 'zod';
import type { FlashcardCandidate, GenerateFlashcardsCommand } from '../../types';
import { openRouterApiKey, openRouterUrl } from '../../db/supabase.client';

// Validation schemas
export const generateFlashcardsSchema = z.object({
  source_text: z.string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text cannot exceed 10000 characters"),
  options: z.object({
    max_flashcards: z.number()
      .int()
      .min(1, "Must generate at least 1 flashcard")
      .max(30, "Cannot generate more than 30 flashcards")
      .default(10)
  }).optional().default({})
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

/**
 * Service for generating flashcard suggestions using AI
 */
export class GenerateService {
  private apiKey: string;
  private modelUrl: string;

  constructor() {
    this.apiKey = openRouterApiKey;
    this.modelUrl = openRouterUrl;
  }

  /**
   * Generate flashcard suggestions based on source text using AI
   * @param command The command containing source text and options
   * @returns A list of flashcard candidates
   */
  async generateFlashcards(command: GenerateFlashcardsInput): Promise<FlashcardCandidate[]> {
    const { source_text, options } = command;
    const maxFlashcards = options.max_flashcards || 10;
    
    try {
      const startTime = new Date();
      const response = await this.callAIService(source_text, maxFlashcards);
      const endTime = new Date();
      
      return this.processAIResponse(response, startTime, endTime);
    } catch (error) {
      console.error('Error generating flashcards with AI:', error);
      throw new Error('Failed to generate flashcards. AI service unavailable.');
    }
  }

  /**
   * Call the OpenRouter.ai API to generate flashcards
   */
  private async callAIService(sourceText: string, maxFlashcards: number): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    // Mock response instead of calling the real API
    console.log(`Mock: Would have sent request to generate ${maxFlashcards} flashcards from ${sourceText.length} characters of text`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock response that matches the expected structure from OpenRouter.ai
    return {
      id: 'mock-response-id',
      model: 'anthropic/claude-3-opus-20240229',
      created_at: new Date().toISOString(),
      response: {
        content: JSON.stringify({
          flashcards: [
            {
              front: "Co to jest fotosynteza?",
              back: "Proces, w którym rośliny wykorzystują energię słoneczną do przekształcania dwutlenku węgla i wody w glukozę i tlen."
            },
            {
              front: "Kim był Mikołaj Kopernik?",
              back: "Polski astronom, który sformułował heliocentryczną teorię Układu Słonecznego."
            },
            {
              front: "Czym jest algorytm?",
              back: "Skończony ciąg jasno zdefiniowanych czynności koniecznych do wykonania pewnego zadania."
            }
          ]
        })
      }
    };
  }

  /**
   * Create the prompt for the AI service (mock implementation)
   * Real business logic will be added later
   */
  private createPrompt(sourceText: string, maxFlashcards: number): string {
    // This is a mock implementation - actual business logic will be added later
    return `Mock prompt: Generate ${maxFlashcards} flashcards from text of length ${sourceText.length}`;
  }

  /**
   * Process the AI response into a format usable by the application
   */
  private processAIResponse(aiResponse: any, startTime: Date, endTime: Date): FlashcardCandidate[] {
    // For the mock implementation, return hardcoded flashcard examples
    const mockFlashcards: FlashcardCandidate[] = [
      {
        front_content: "Przykładowe pytanie 1",
        back_content: "Przykładowa odpowiedź 1",
        ai_metadata: {
          model: "anthropic/claude-3-opus-20240229",
          generation_time: `${endTime.getTime() - startTime.getTime()}ms`,
          parameters: {
            max_flashcards: 10,
            model_parameters: {}
          }
        }
      },
      {
        front_content: "Przykładowe pytanie 2",
        back_content: "Przykładowa odpowiedź 2",
        ai_metadata: {
          model: "anthropic/claude-3-opus-20240229",
          generation_time: `${endTime.getTime() - startTime.getTime()}ms`,
          parameters: {
            max_flashcards: 10,
            model_parameters: {}
          }
        }
      }
    ];

    return mockFlashcards;
  }
}

// Export a singleton instance
export const generateService = new GenerateService(); 