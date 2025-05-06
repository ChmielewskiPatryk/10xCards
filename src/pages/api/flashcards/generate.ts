import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabaseClient } from '../../../db/supabase.client';
import type { GenerateFlashcardsCommand, FlashcardCandidate } from '../../../types';
import { aiService } from '../../../lib/services/ai-service';
import { loggerService } from '../../../lib/services/logger-service';

// Schema for validating request body
const generateFlashcardsSchema = z.object({
  source_text: z.string().min(1000, "Content must be at least 1000 characters long").max(10000, "Content must be at most 10000 characters long"),
});

export const prerender = false;

/**
 * API endpoint for generating flashcard suggestions using AI
 * 
 * @endpoint POST /api/flashcards/generate
 * @param source_text - Text from which to generate flashcards
 * @param options.max_flashcards - Optional maximum number of flashcards to generate
 * @returns List of flashcard suggestions
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Użyj ID zalogowanego użytkownika
  const userId = locals.user?.id;
  
  // Jeśli użytkownik nie jest zalogowany, zwróć błąd 401
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Please log in to access this resource' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log(body);
    const validationResult = generateFlashcardsSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessage = 'Validation error in request body';
      await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: validationResult.error.format() 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log('prepare')
    // Prepare the flashcard generation schema
    const flashcardSchema = z.array(z.object({
      front_content: z.string(),
      back_content: z.string(),
      ai_metadata: z.object({
        model: z.string(),
        generation_time: z.string(),
        parameters: z.record(z.unknown())
      })
    }));
    
    // Extract structured data using AI
    const content = validationResult.data.source_text;
    console.log(content);
    const instructions = "Generate a set of flashcards from the provided text.";
    const generatedFlashcards = await aiService.extractData<FlashcardCandidate[]>(
      flashcardSchema,
      content,
      instructions
    );
    
    // Return response
    return new Response(
      JSON.stringify({ flashcards_proposals: generatedFlashcards }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/flashcards/generate:', error);
    
    // Log the error
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An internal server error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    await loggerService.logError(userId, errorCode, errorMessage);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 