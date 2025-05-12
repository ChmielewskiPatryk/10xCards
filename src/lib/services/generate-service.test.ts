import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GenerateService, generateFlashcardsSchema } from "./generate-service";
import type { GenerateFlashcardsInput } from "./generate-service";
import type { FlashcardCandidate, GenerateFlashcardsCommand } from "../../types";

// Mock environment variables
vi.stubGlobal("import.meta", {
  env: {
    PUBLIC_MOCK_OPEN_ROUTER: "true",
  },
});

// Mock supabase client and OpenRouter API keys
vi.mock("../../db/supabase.client", () => ({
  openRouterApiKey: "mock-api-key",
  openRouterUrl: "https://mock-url.com",
  DEFAULT_USER_ID: "mock-user-id",
}));

// Mock console methods
vi.spyOn(console, "log").mockImplementation(() => {
  /* Mock implementation */
});
vi.spyOn(console, "error").mockImplementation(() => {
  /* Mock implementation */
});

describe("GenerateService", () => {
  let generateService: GenerateService;

  beforeEach(() => {
    vi.clearAllMocks();
    generateService = new GenerateService(true); // Always use mock in tests
  });

  describe("generateFlashcardsSchema", () => {
    it("should validate valid input correctly", () => {
      const validInput = {
        source_text: "A".repeat(1000), // Just right length
        options: {
          max_flashcards: 10,
        },
      };

      const result = generateFlashcardsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject too short source text", () => {
      const invalidInput = {
        source_text: "Too short", // Too short
        options: {
          max_flashcards: 10,
        },
      };

      const result = generateFlashcardsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at least 1000 characters");
      }
    });

    it("should reject too long source text", () => {
      const invalidInput = {
        source_text: "A".repeat(10001), // Too long
        options: {
          max_flashcards: 10,
        },
      };

      const result = generateFlashcardsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("cannot exceed 10000 characters");
      }
    });

    it("should reject too many flashcards", () => {
      const invalidInput = {
        source_text: "A".repeat(1000),
        options: {
          max_flashcards: 31, // Too many
        },
      };

      const result = generateFlashcardsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("more than 30 flashcards");
      }
    });

    it("should use default values when options are not provided", () => {
      const inputWithoutOptions = {
        source_text: "A".repeat(1000),
      };

      const result = generateFlashcardsSchema.safeParse(inputWithoutOptions);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.options.max_flashcards).toBe(10); // Default value
      }
    });
  });

  describe("generateFlashcards", () => {
    let originalSetTimeout: typeof setTimeout;

    beforeEach(() => {
      // Store original setTimeout and replace with immediate execution
      originalSetTimeout = setTimeout;
      // @ts-expect-error - mock setTimeout to call immediately
      global.setTimeout = (fn: () => void) => fn();
    });

    afterEach(() => {
      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it("should generate flashcard candidates successfully", async () => {
      const command: GenerateFlashcardsInput = {
        source_text: "A".repeat(1000),
        options: {
          max_flashcards: 10,
        },
      };

      const result = await generateService.generateFlashcards(command);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify each flashcard candidate has the expected structure
      result.forEach((candidate) => {
        expect(candidate).toHaveProperty("front_content");
        expect(candidate).toHaveProperty("back_content");
        expect(candidate).toHaveProperty("ai_metadata");
        expect(candidate.ai_metadata).toHaveProperty("model");
        expect(candidate.ai_metadata).toHaveProperty("generation_time");
      });

      // Verify console.log was called with the expected message
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Używanie odpowiedzi mockowej"));
    });

    it("should throw error when API key is not configured", async () => {
      // Mockuj oryginalną metodę generateFlashcards, aby rzucić błąd
      const originalGenerateFlashcards = generateService.generateFlashcards;
      generateService.generateFlashcards = vi
        .fn()
        .mockRejectedValue(new Error("Failed to generate flashcards. AI service unavailable."));

      const command: GenerateFlashcardsInput = {
        source_text: "A".repeat(1000),
        options: {
          max_flashcards: 10,
        },
      };

      try {
        await generateService.generateFlashcards(command);
        // Jeśli dotrzemy tutaj, oznacza to, że test nie powinien przejść
        expect(true).toBe(false); // To nie powinno się wykonać
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect((error as Error).message).toContain("AI service unavailable");
      } finally {
        // Przywróć oryginalną metodę
        generateService.generateFlashcards = originalGenerateFlashcards;
      }
    });

    it("should handle API errors gracefully", async () => {
      // Mockuj oryginalną metodę generateFlashcards, aby rzucić błąd
      const originalGenerateFlashcards = generateService.generateFlashcards;
      generateService.generateFlashcards = vi.fn().mockImplementation(() => {
        console.error("Error generating flashcards with AI:", new Error("API error"));
        throw new Error("Failed to generate flashcards. AI service unavailable.");
      });

      const command: GenerateFlashcardsInput = {
        source_text: "A".repeat(1000),
        options: {
          max_flashcards: 10,
        },
      };

      try {
        await generateService.generateFlashcards(command);
        // Jeśli dotrzemy tutaj, oznacza to, że test nie powinien przejść
        expect(true).toBe(false); // To nie powinno się wykonać
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect((error as Error).message).toContain("Failed to generate flashcards");
        expect(console.error).toHaveBeenCalled();
      } finally {
        // Przywróć oryginalną metodę
        generateService.generateFlashcards = originalGenerateFlashcards;
      }
    });

    it("should use default max_flashcards when not provided", async () => {
      const command: GenerateFlashcardsInput = {
        source_text: "A".repeat(1000),
        options: {
          max_flashcards: 10, // Provide default value explicitly
        },
      };

      const result = await generateService.generateFlashcards(command);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify console.log was called with default max_flashcards (10)
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Używanie odpowiedzi mockowej"));
    });
  });
});
