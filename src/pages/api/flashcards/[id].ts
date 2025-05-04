import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { Flashcard } from '../../../types';
import { flashcardService, NotFoundError } from '../../../lib/services/flashcard-service';
import { supabaseClient } from '../../../db/supabase.client';
import { loggerService } from '../../../lib/services/logger-service';
import type { Json } from '../../../db/database.types';

// Schema for validating route parameters
const idParamSchema = z.object({ id: z.string().uuid() });

// Validate UUID format
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * GET /api/flashcards/:id
 * Retrieve a single flashcard by its ID, ensuring it belongs to the user.
 */
export const GET: APIRoute = async ({ params, locals }) => {
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
    // Validate flashcard ID
    const idValidation = uuidSchema.safeParse(params.id);
    if (!idValidation.success) {
      loggerService.logError(userId, 'VALIDATION_FAILED', 'Invalid flashcard id');
      return new Response(
        JSON.stringify({ error: 'Invalid flashcard ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const flashcardId = idValidation.data;
    
    // Get flashcard by ID, passing the authenticated Supabase client
    const flashcard = await flashcardService.getById(userId, flashcardId, locals.supabase);
    
    // Return the flashcard
    return new Response(
      JSON.stringify(flashcard),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in GET /api/flashcards/:id:', error);
    
    // Determine the appropriate error status and message
    let status = 500;
    let errorMessage = 'An internal server error occurred';
    let errorCode = 'INTERNAL_ERROR';
    
    if (error instanceof NotFoundError) {
      status = 404;
      errorMessage = 'Flashcard not found';
      errorCode = 'NOT_FOUND';
      loggerService.logError(userId, errorCode, 'Not found');
    } else if (error instanceof Error) {
      errorMessage = error.message;
      loggerService.logError(userId, errorCode, error.message);
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { 'Content-Type': 'application/json' } }
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
export const PUT: APIRoute = async ({ request, params, locals }) => {
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
    // Validate flashcard ID
    const idValidation = uuidSchema.safeParse(params.id);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid flashcard ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const flashcardId = idValidation.data;
    
    // Validate request body
    const updateSchema = z.object({
      front_content: z.string().min(1).max(200).optional(),
      back_content: z.string().min(1).max(200).optional(),
    }).refine(data => data.front_content || data.back_content, {
      message: "At least one of front_content or back_content must be provided"
    });
    
    const body = await request.json();
    const validationResult = updateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error in request body',
          details: validationResult.error.format()
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Update the flashcard, passing the authenticated Supabase client
    const updatedFlashcard = await flashcardService.updateFlashcard(
      flashcardId,
      validationResult.data,
      userId,
      locals.supabase
    );
    
    // Return the updated flashcard
    return new Response(
      JSON.stringify(updatedFlashcard),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in PUT /api/flashcards/:id:', error);
    
    // Determine the appropriate error status and message
    let status = 500;
    let errorMessage = 'An internal server error occurred';
    
    if (error instanceof NotFoundError) {
      status = 404;
      errorMessage = 'Flashcard not found';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/flashcards/:id
 * Delete a flashcard by its ID, ensuring it belongs to the user.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  // Użyj ID zalogowanego użytkownika zamiast stałego ID
  const userId = locals.user?.id;
  
  // Jeśli użytkownik nie jest zalogowany, zwróć błąd 401
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Please log in to access this resource' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Validate flashcard ID
    const idValidation = uuidSchema.safeParse(params.id);
    if (!idValidation.success) {
      loggerService.logError(userId, 'VALIDATION_FAILED', 'Invalid flashcard id');
      return new Response(
        JSON.stringify({ error: 'Invalid flashcard ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const flashcardId = idValidation.data;
    
    // Delete the flashcard, passing the authenticated Supabase client
    await flashcardService.deleteFlashcard(flashcardId, userId, locals.supabase);
    
    // Return success response
    return new Response(
      JSON.stringify({ message: 'Flashcard deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in DELETE /api/flashcards/:id:', error);
    
    // Determine the appropriate error status and message
    let status = 500;
    let errorMessage = 'An internal server error occurred';
    let errorCode = 'INTERNAL_ERROR';
    
    if (error instanceof NotFoundError) {
      status = 404;
      errorMessage = 'Flashcard not found';
      errorCode = 'NOT_FOUND';
      loggerService.logError(userId, errorCode, 'Flashcard not found');
    } else if (error instanceof Error) {
      errorMessage = error.message;
      loggerService.logError(userId, errorCode, error.message);
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 