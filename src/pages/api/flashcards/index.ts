import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { PaginatedResponse, Flashcard, CreateFlashcardCommand } from '../../../types';
import { flashcardService } from '../../../lib/services/flashcard-service';
import { DEFAULT_USER_ID } from '../../../db/supabase.client';
import { loggerService } from '../../../lib/services/logger-service';

// Schema for validating query parameters
export const getFlashcardsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sort: z.enum(['created_at', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  source: z.enum(['manual', 'ai', 'semi_ai']).optional(),
});

export type GetFlashcardsQueryParams = z.infer<typeof getFlashcardsQuerySchema>;

// Schema for validating flashcard creation
const createFlashcardSchema = z.object({
  front_content: z.string().min(1).max(200),
  back_content: z.string().min(1).max(200),
});

type CreateFlashcardBody = z.infer<typeof createFlashcardSchema>;

/**
 * API endpoint for retrieving user's flashcards with optional filtering, sorting, and pagination
 * 
 * @endpoint GET /api/flashcards
 * @param page - Page number, default 1
 * @param limit - Items per page, default 20, maximum 100
 * @param sort - Sort field (created_at, updated_at), default created_at
 * @param order - Sort order (asc, desc), default desc
 * @param source - Filter by source (manual, ai, semi_ai)
 * @returns Paginated list of user's flashcards
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const userId = DEFAULT_USER_ID;
  
  try {
    // 1. Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    
    // 2. Validate against schema
    const validationResult = getFlashcardsQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      const errorMessage = 'Validation error in query parameters';
      await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: validationResult.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const params = validationResult.data;
    
    // 3. Call FlashcardService to get user's flashcards
    const result = await flashcardService.getUserFlashcards(userId, params);
    
    // 4. Return formatted response
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/flashcards:', error);
    
    // Determine the appropriate error status and message
    let status = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An internal server error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Log the error
    await loggerService.logError(userId, errorCode, errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * API endpoint for creating a new flashcard
 *
 * @endpoint POST /api/flashcards
 * @param front_content - Content on the front side of the flashcard, max 200 characters
 * @param back_content - Content on the back side of the flashcard, max 200 characters
 * @returns Created flashcard
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const userId = DEFAULT_USER_ID;
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = 'Validation error in request body';
      await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
      return new Response(
        JSON.stringify({ error: errorMessage, details: validationResult.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Build command object from validated data
    const { front_content, back_content } = validationResult.data;
    const command: CreateFlashcardCommand = { front_content, back_content };
    // Create flashcard via service
    const flashcard = await flashcardService.createFlashcard(command, userId);
    // Return the created flashcard
    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in POST /api/flashcards:', error);
    let status = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    await loggerService.logError(userId, errorCode, errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 