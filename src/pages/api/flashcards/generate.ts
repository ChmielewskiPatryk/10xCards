import type { APIRoute } from 'astro';
import { generateFlashcardsSchema, generateService } from '../../../lib/services/generate-service';
import type { GenerateFlashcardsResponse } from '../../../types';
import { DEFAULT_USER_ID, supabaseClient } from '../../../db/supabase.client';
import { loggerService } from '../../../lib/services/logger-service';

export const pretender = false;

/**
 * API endpoint for generating flashcard suggestions using AI
 * 
 * @endpoint POST /api/flashcards/generate
 * @param source_text - Text from which to generate flashcards
 * @param options.max_flashcards - Optional maximum number of flashcards to generate
 * @returns List of flashcard suggestions
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Using DEFAULT_USER_ID for now, authentication will be implemented later
  const userId = DEFAULT_USER_ID;
  
  try {
    // 1. Use the Supabase client from context if available, but don't require it
    const supabase = locals.supabase;

    // 2. Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      const errorMessage = 'Invalid JSON in request body';
      await loggerService.logError(userId, 'INVALID_JSON', errorMessage);
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate against schema
    const validationResult = generateFlashcardsSchema.safeParse(requestBody);
    if (!validationResult.success) {
      const errorMessage = 'Validation error';
      await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: validationResult.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }


    // 4. Call AI service to generate flashcards
    const flashcards = await generateService.generateFlashcards(validationResult.data);

    // 5. Format the response
    const response: GenerateFlashcardsResponse = {
      flashcards_proposals: flashcards
    };

    // 6. Return the formatted response
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/flashcards/generate:', error);
    
    // Determine the appropriate error status and message
    let status = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An internal server error occurred';
    let model: string | undefined = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (errorMessage.includes('AI service unavailable')) {
        status = 503; // Service Unavailable
        errorCode = 'AI_SERVICE_UNAVAILABLE';
        model = 'anthropic/claude-3-opus-20240229'; // Example model
      } else if (errorMessage.includes('rate limit')) {
        status = 429; // Too Many Requests
        errorCode = 'RATE_LIMIT_EXCEEDED';
      }
    }
    
    // Log the error
    await loggerService.logError(userId, errorCode, errorMessage, model);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 