import type { APIRoute } from "astro";
import { generateFlashcardsSchema as commandSchema, generateService } from "../../../lib/services/generate-service";
import { loggerService } from "../../../lib/services/logger-service";

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
    return new Response(JSON.stringify({ error: "Unauthorized - Please log in to access this resource" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const validationResult = commandSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = "Validation error in request body";
      await loggerService.logError(userId, "VALIDATION_FAILED", errorMessage);

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: validationResult.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate flashcards using generateService
    const command = validationResult.data;
    const generatedFlashcards = await generateService.generateFlashcards(command);

    // Return response
    return new Response(JSON.stringify({ flashcards_proposals: generatedFlashcards }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/flashcards/generate:", error);

    // Log the error
    const errorCode = "INTERNAL_ERROR";
    let errorMessage = "An internal server error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    await loggerService.logError(userId, errorCode, errorMessage);

    // Return error response
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
