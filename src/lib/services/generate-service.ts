import { z } from 'zod';
import type { FlashcardCandidate, GenerateFlashcardsCommand } from '../../types';
import { openRouterApiKey, openRouterUrl } from '../../db/supabase.client';
import { openRouterService } from './openrouter';
import type { OpenRouterResponseFormat } from './openrouter';

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
  private useMockResponse: boolean;

  constructor(useMockResponse = false) {
    this.apiKey = openRouterApiKey;
    this.modelUrl = openRouterUrl;
    this.useMockResponse = useMockResponse;
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
      
      // Provide detailed error message
      const errorMessage = error instanceof Error 
        ? `Nie udało się wygenerować fiszek: ${error.message}`
        : 'Nie udało się wygenerować fiszek. Usługa AI jest niedostępna.';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Call the OpenRouter.ai API to generate flashcards
   */
  private async callAIService(sourceText: string, maxFlashcards: number): Promise<any> {
    // Use mock response only if explicitly configured to do so
    // or if the API service is not properly configured
    const apiNotConfigured = !this.apiKey || !openRouterService.isConfigured();
    
    if (this.useMockResponse || apiNotConfigured) {
      const reason = !this.apiKey 
        ? 'Klucz API nie skonfigurowany'
        : !openRouterService.isConfigured() 
          ? 'Usługa OpenRouter nie jest poprawnie skonfigurowana' 
          : 'Tryb mock włączony';
      
      console.log(`Używanie odpowiedzi mockowej (Powód: ${reason}). Miało zostać wygenerowanych ${maxFlashcards} fiszek z ${sourceText.length} znaków tekstu`);
      
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

    try {
      console.log(`Wywołanie API OpenRouter w celu wygenerowania ${maxFlashcards} fiszek...`);
      
      // Create prompt for flashcard generation
      const prompt = this.createPrompt(sourceText, maxFlashcards);
      
      // Define the schema for the expected response
      const responseSchema: OpenRouterResponseFormat = {
        type: "json_schema",
        json_schema: {
          name: 'FlashcardGenerationResult',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              flashcards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    front: { type: 'string' },
                    back: { type: 'string' }
                  },
                  required: ['front', 'back']
                }
              }
            },
            required: ['flashcards']
          }
        }
      };
      
      // Use OpenRouterService to call the AI API
      const response = await openRouterService.chat({
        messages: [
          {
            role: 'system',
            content: 'Jesteś polskim ekspertem specjalizującym się w tworzeniu fiszek edukacyjnych na podstawie podanego tekstu. Twórz zwięzłe pary pytanie-odpowiedź, które efektywnie sprawdzają zrozumienie kluczowych pojęć. Wszystkie fiszki MUSZĄ być w języku polskim. Nie używaj angielskiego ani żadnego innego języka w swoich odpowiedziach.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'anthropic/claude-3-opus',
        responseFormat: responseSchema,
        temperature: 0.7,
        max_tokens: 1500
      });
      
      console.log(`Otrzymano odpowiedź od modelu: ${response.model}`);
      
      // Return response in similar format to mock data
      return {
        id: response.id,
        model: response.model,
        created_at: new Date(response.created * 1000).toISOString(),
        response: {
          content: response.content
        }
      };
    } catch (error) {
      // Log error details for debugging
      console.error('Błąd wywołania API OpenRouter:', error);
      
      // Propagate the error instead of falling back to mock response
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      throw new Error(`Błąd komunikacji z usługą AI: ${errorMessage}`);
    }
  }

  /**
   * Create the prompt for the AI service
   */
  private createPrompt(sourceText: string, maxFlashcards: number): string {
    return `
    Wygeneruj ${maxFlashcards} fiszek na podstawie poniższego tekstu.
    Każda fiszka powinna mieć jasne pytanie na przodzie i zwięzłą, dokładną odpowiedź na odwrocie.
    Skoncentruj się na najważniejszych pojęciach, definicjach i relacjach.
    Upewnij się, że pytania są konkretne, a odpowiedzi wyczerpujące, ale niezbyt długie.
    
    BARDZO WAŻNE: Wszystkie fiszki muszą być w języku polskim. Nie używaj angielskiego ani żadnego innego języka.
    
    TEKST:
    ${sourceText}
    
    Sformatuj swoją odpowiedź jako obiekt JSON z tablicą "flashcards", gdzie każdy element ma właściwości "front" i "back".
    Nie dodawaj żadnego wprowadzenia ani komentarzy przed lub po obiekcie JSON.
    `;
  }

  /**
   * Process the AI response into a format usable by the application
   */
  private processAIResponse(aiResponse: any, startTime: Date, endTime: Date): FlashcardCandidate[] {
    try {
      const content = aiResponse.response.content;
      
      // Wyodrębnij faktyczny JSON z odpowiedzi
      let jsonContent = content;
      if (typeof content === 'string') {
        // Szukaj pierwszego wystąpienia { i ostatniego }
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          // Wyodrębnij tekst między nawiasami klamrowymi
          jsonContent = content.substring(firstBrace, lastBrace + 1);
        }
      }
      
      // Parsuj wyodrębniony JSON
      const flashcardsData = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      
      if (!flashcardsData.flashcards || !Array.isArray(flashcardsData.flashcards)) {
        console.error('Nieprawidłowy format odpowiedzi:', flashcardsData);
        throw new Error('Nieprawidłowy format odpowiedzi z usługi AI - brak tablicy fiszek');
      }
      
      return flashcardsData.flashcards.map((card: any) => ({
        front_content: card.front,
        back_content: card.back,
        ai_metadata: {
          model: aiResponse.model,
          generation_time: `${endTime.getTime() - startTime.getTime()}ms`,
          parameters: {
            max_flashcards: flashcardsData.flashcards.length,
            model_parameters: {}
          }
        }
      }));
    } catch (error) {
      // Log error details including the response content
      console.error('Błąd przetwarzania odpowiedzi AI:', error);
      console.log('Zawartość odpowiedzi:', aiResponse.response.content);
      
      // Propagate the error instead of falling back to mock data
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd przetwarzania';
      throw new Error(`Błąd przetwarzania odpowiedzi AI: ${errorMessage}`);
    }
  }
}

// Export a singleton instance
export const generateService = new GenerateService(import.meta.env.MOCK_OPEN_ROUTER === 'true'); // Use environment variable to control mock behavior 