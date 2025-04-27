import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { Flashcard } from '../../../types';
import { flashcardService, NotFoundError } from '../../../lib/services/flashcard-service';
import { DEFAULT_USER_ID, supabaseClient } from '../../../db/supabase.client';
import { loggerService } from '../../../lib/services/logger-service';
import type { Json } from '../../../db/database.types';

// Schema for validating route parameters
const idParamSchema = z.object({ id: z.string().uuid() });

/**
 * GET /api/flashcards/:id
 * Retrieve a single flashcard by its ID, ensuring it belongs to the user.
 */
export const GET: APIRoute = async ({ params }) => {
  const userId = DEFAULT_USER_ID;

  // Validate route parameter
  const parsedParams = idParamSchema.safeParse(params);
  if (!parsedParams.success) {
    const errorMessage = 'Invalid flashcard id';
    await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, details: parsedParams.error.format() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { id } = parsedParams.data;
  try {
    // Fetch flashcard
    const flashcard = await flashcardService.getById(userId, id);
    return new Response(
      JSON.stringify(flashcard),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      const errorMessage = error.message;
      await loggerService.logError(userId, 'NOT_FOUND', errorMessage);
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Internal server error
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    await loggerService.logError(userId, 'INTERNAL_ERROR', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Schema for validating flashcard update data
const updateFlashcardSchema = z.object({
  front_content: z.string().min(1).max(200),
  back_content: z.string().min(1).max(200),
  ai_metadata: z.record(z.unknown()).optional()
});

/**
 * PUT /api/flashcards/:id
 * Update a flashcard by its ID, ensuring it belongs to the user.
 * If the flashcard was created by AI and is edited, its source will be changed to 'semi_ai'.
 */
export const PUT: APIRoute = async ({ params, request }) => {
  const userId = DEFAULT_USER_ID;

  // Validate route parameter
  const parsedParams = idParamSchema.safeParse(params);
  if (!parsedParams.success) {
    const errorMessage = 'Invalid flashcard id';
    await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, details: parsedParams.error.format() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { id } = parsedParams.data;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = 'Validation error in request body';
      await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
      return new Response(
        JSON.stringify({ error: errorMessage, details: validationResult.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get existing flashcard to check if it exists and belongs to the user
    const existingFlashcard = await flashcardService.getById(userId, id);
    
    // Determine if this is an AI-generated flashcard being modified
    const isAiFlashcard = existingFlashcard.source === 'ai';
    const isContentModified = 
      existingFlashcard.front_content !== validationResult.data.front_content || 
      existingFlashcard.back_content !== validationResult.data.back_content;
    
    // Set source to 'semi_ai' if this is an AI flashcard being modified
    const source = (isAiFlashcard && isContentModified) ? 'semi_ai' : existingFlashcard.source;
    
    // Update the flashcard via Supabase
    const { data, error } = await supabaseClient
      .from('flashcards')
      .update({
        front_content: validationResult.data.front_content,
        back_content: validationResult.data.back_content,
        source: source,
        ai_metadata: (validationResult.data.ai_metadata || existingFlashcard.ai_metadata) as Json,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, front_content, back_content, source, ai_metadata, created_at, updated_at')
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new NotFoundError();
    }
    
    // Return the updated flashcard
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      const errorMessage = error.message;
      await loggerService.logError(userId, 'NOT_FOUND', errorMessage);
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Internal server error
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    await loggerService.logError(userId, 'INTERNAL_ERROR', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid flashcard ID format');

export const DELETE: APIRoute = async ({ params, locals }) => {
  // Get Supabase client from context
  const supabase = locals.supabase;
  
  // Using DEFAULT_USER_ID for now, authentication will be implemented later
  const userId = DEFAULT_USER_ID;

  // Validate route parameter
  const parsedParams = idParamSchema.safeParse(params);
  if (!parsedParams.success) {
    const errorMessage = 'Invalid flashcard id';
    await loggerService.logError(userId, 'VALIDATION_FAILED', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, details: parsedParams.error.format() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { id } = parsedParams.data;
  
  try {
    // Call service to delete flashcard
    await flashcardService.deleteFlashcard(id, userId);
    
    // Return No Content status on successful deletion
    return new Response(null, { 
      status: 204 
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      const errorMessage = error.message;
      await loggerService.logError(userId, 'NOT_FOUND', errorMessage);
      return new Response(JSON.stringify({ 
        error: 'Not Found', 
        message: errorMessage 
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Log internal server errors
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request';
    await loggerService.logError(userId, 'INTERNAL_ERROR', errorMessage);
    
    // Return generic error for other cases
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: errorMessage 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 