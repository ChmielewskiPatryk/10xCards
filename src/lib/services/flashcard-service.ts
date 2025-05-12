import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseClient } from "../../db/supabase.client";
import type {
  ApproveFlashcardsCommand,
  ApproveFlashcardsResponse,
  Flashcard,
  FlashcardCandidate,
  PaginatedResponse,
  CreateFlashcardCommand,
} from "../../types";
import type { Database, Json } from "../../db/database.types";

// Import type from API endpoint
import type { GetFlashcardsQueryParams } from "../../pages/api/flashcards";

// Add NotFoundError class for missing flashcards
export class NotFoundError extends Error {
  constructor(message = "Flashcard not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Service for flashcard operations
 */
export class FlashcardService {
  /**
   * Approves and saves flashcards to the database
   * @param command Command containing flashcards to approve
   * @param userId ID of the user approving flashcards
   * @param client Optional custom Supabase client with auth context
   * @returns Response with approved flashcards and count
   */
  async approveFlashcards(
    command: ApproveFlashcardsCommand,
    userId: string,
    client?: SupabaseClient<Database>
  ): Promise<ApproveFlashcardsResponse> {
    const supabase = client || supabaseClient;
    const { flashcards } = command;

    // Process each flashcard to determine source
    const flashcardsToInsert = flashcards.map((flashcard) => {
      // Check for direct wasEdited property at the top level
      const directWasEdited = !!(flashcard as any).wasEdited;

      // Check for wasEdited in ai_metadata
      const metadataWasEdited = !!flashcard.ai_metadata?.wasEdited;

      // DIRECT SOLUTION: Use wasEdited directly to determine source without relying on isFlashcardModified
      const isEdited =
        directWasEdited || metadataWasEdited || !!flashcard.ai_metadata?.modified || !!flashcard.ai_metadata?.edited_at;

      const source: Database["public"]["Enums"]["flashcard_source"] = isEdited ? "semi_ai" : "ai";

      return {
        front_content: flashcard.front_content,
        back_content: flashcard.back_content,
        ai_metadata: flashcard.ai_metadata as Json,
        source,
        user_id: userId,
      };
    });

    // Maximum number of flashcards to insert in a single batch
    const BATCH_SIZE = 50;
    let allInsertedFlashcards: Flashcard[] = [];

    // Process flashcards in batches if needed
    for (let i = 0; i < flashcardsToInsert.length; i += BATCH_SIZE) {
      const batch = flashcardsToInsert.slice(i, i + BATCH_SIZE);

      try {
        // Start a transaction for each batch
        const { data: insertedBatch, error } = await supabase
          .from("flashcards")
          .insert(batch)
          .select("id, front_content, back_content, source, ai_metadata, created_at, updated_at");

        if (error) {
          throw error;
        }

        if (insertedBatch) {
          allInsertedFlashcards = [...allInsertedFlashcards, ...(insertedBatch as Flashcard[])];
        }
      } catch (error) {
        console.error(`Failed to insert batch ${i / BATCH_SIZE + 1}:`, error);
        throw new Error(
          `Failed to save flashcards batch ${i / BATCH_SIZE + 1}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Return approved flashcards
    return {
      approved: allInsertedFlashcards,
      count: allInsertedFlashcards.length,
    };
  }

  /**
   * Determines if a flashcard was modified by comparing with original AI proposal
   * @param flashcard Flashcard candidate to check
   * @returns true if flashcard was modified, false otherwise
   */
  private isFlashcardModified(flashcard: FlashcardCandidate): boolean {
    // Check if ai_metadata contains original_content field
    const metadata = flashcard.ai_metadata;

    // Check explicit properties on the flashcard object
    if ((flashcard as any).wasEdited === true) {
      return true;
    }

    if (!metadata || typeof metadata !== "object") {
      return false;
    }

    // Check for wasEdited in ai_metadata (most important check)
    if (metadata.wasEdited === true) {
      return true;
    }

    // Explicit modification flag
    if (metadata.modified === true) {
      return true;
    }

    // Check for an edited_at timestamp that would indicate modification
    if (metadata.edited_at) {
      return true;
    }

    // If metadata contains original content, compare it with current content
    if (metadata.original_content) {
      const original = metadata.original_content as {
        front_content?: string;
        back_content?: string;
      };

      // Compare original content with current content
      if (original.front_content && original.front_content !== flashcard.front_content) {
        return true;
      }

      if (original.back_content && original.back_content !== flashcard.back_content) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retrieves user's flashcards with filtering, sorting, and pagination
   * @param userId ID of the user
   * @param params Query parameters for filtering, sorting, and pagination
   * @param client Optional custom Supabase client with auth context
   * @returns Paginated list of user's flashcards
   */
  async getUserFlashcards(
    userId: string,
    params: GetFlashcardsQueryParams,
    client?: SupabaseClient<Database>
  ): Promise<PaginatedResponse<Flashcard>> {
    const supabase = client || supabaseClient;
    const { page, limit, sort, order, source } = params;

    // Calculate pagination values
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from("flashcards")
      .select("id, front_content, back_content, source, ai_metadata, created_at, updated_at", { count: "exact" })
      .eq("user_id", userId)
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    // Apply source filter if provided
    if (source) {
      query = query.eq("source", source);
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to retrieve flashcards: ${error.message}`);
    }

    // Calculate total pages
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    // Return the paginated response
    return {
      data: data as Flashcard[],
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  /**
   * Retrieves a single flashcard by its ID
   * @param userId ID of the user
   * @param id ID of the flashcard
   * @param client Optional custom Supabase client with auth context
   * @returns Flashcard if found
   * @throws NotFoundError if flashcard not found
   */
  async getById(userId: string, id: string, client?: SupabaseClient<Database>): Promise<Flashcard> {
    const supabase = client || supabaseClient;
    const { data, error } = await supabase
      .from("flashcards")
      .select("id, front_content, back_content, source, ai_metadata, created_at, updated_at")
      .eq("user_id", userId)
      .eq("id", id)
      .single();

    if (error) {
      // Handle case when no rows found
      if (error.code === "PGRST116" || error.message.includes("No rows")) {
        throw new NotFoundError();
      }
      throw error;
    }

    if (!data) {
      throw new NotFoundError();
    }

    return data as Flashcard;
  }

  /**
   * Creates a new flashcard in the database
   * @param command CreateFlashcardCommand containing front and back content
   * @param userId ID of the user creating the flashcard
   * @param client Optional custom Supabase client with auth context
   * @returns The created flashcard
   */
  async createFlashcard(
    command: CreateFlashcardCommand,
    userId: string,
    client?: SupabaseClient<Database>
  ): Promise<Flashcard> {
    const supabase = client || supabaseClient;
    const { front_content, back_content } = command;
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .insert([{ front_content, back_content, user_id: userId }])
        .select("id, front_content, back_content, source, ai_metadata, created_at, updated_at")
        .single();
      if (error || !data) {
        throw error || new Error("Failed to create flashcard");
      }
      return data as Flashcard;
    } catch (error) {
      console.error("Error creating flashcard:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Updates an existing flashcard
   * @param id ID of the flashcard to update
   * @param updates Fields to update
   * @param userId ID of the user who owns the flashcard
   * @param client Optional custom Supabase client with auth context
   * @returns The updated flashcard
   * @throws NotFoundError if flashcard not found
   */
  async updateFlashcard(
    id: string,
    updates: { front_content?: string; back_content?: string },
    userId: string,
    client?: SupabaseClient<Database>
  ): Promise<Flashcard> {
    const supabase = client || supabaseClient;
    try {
      // First check if the flashcard exists and belongs to the user
      const existingFlashcard = await this.getById(userId, id, supabase);

      // Determine if this is an AI-generated flashcard being modified
      const isAiFlashcard = existingFlashcard.source === "ai";
      const isContentModified =
        (updates.front_content && existingFlashcard.front_content !== updates.front_content) ||
        (updates.back_content && existingFlashcard.back_content !== updates.back_content);

      // Set source to 'semi_ai' if this is an AI flashcard being modified
      const source = isAiFlashcard && isContentModified ? "semi_ai" : existingFlashcard.source;

      // Update the flashcard
      const { data, error } = await supabase
        .from("flashcards")
        .update({
          ...updates,
          source,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select("id, front_content, back_content, source, ai_metadata, created_at, updated_at")
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new NotFoundError();
      }

      return data as Flashcard;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error updating flashcard:", error);
      throw new Error(`Failed to update flashcard: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deletes a flashcard from the database
   * @param id ID of the flashcard to delete
   * @param userId ID of the user who owns the flashcard
   * @param client Optional custom Supabase client with auth context
   * @throws NotFoundError if flashcard does not exist or does not belong to the user
   */
  async deleteFlashcard(id: string, userId: string, client?: SupabaseClient<Database>): Promise<void> {
    const supabase = client || supabaseClient;
    try {
      // First check if the flashcard exists and belongs to the user
      const { data, error } = await supabase
        .from("flashcards")
        .select("id")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        // Handle case when no rows found
        if (error.code === "PGRST116" || error.message.includes("No rows")) {
          throw new NotFoundError();
        }
        throw error;
      }

      if (!data) {
        throw new NotFoundError();
      }

      // If the flashcard exists and belongs to the user, delete it
      const { error: deleteError } = await supabase.from("flashcards").delete().eq("id", id).eq("user_id", userId);

      if (deleteError) {
        throw deleteError;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error deleting flashcard:", error);
      throw new Error(`Failed to delete flashcard: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export a singleton instance
export const flashcardService = new FlashcardService();
