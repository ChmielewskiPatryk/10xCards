import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, DELETE } from "./[id]";
import { flashcardService, NotFoundError } from "../../../lib/services/flashcard-service";
import { loggerService } from "../../../lib/services/logger-service";

// Mock supabase client and constant
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

vi.mock("../../../db/supabase.client", () => ({
  DEFAULT_USER_ID: "00000000-0000-0000-0000-000000000000",
  supabaseClient: {
    from: vi.fn(),
  },
}));

// Mock flashcard-service and NotFoundError for consistent instanceof checks
vi.mock("../../../lib/services/flashcard-service", () => {
  class MockNotFoundError extends Error {
    constructor(message = "Flashcard not found") {
      super(message);
      this.name = "NotFoundError";
    }
  }
  return {
    flashcardService: {
      getById: vi.fn(),
      deleteFlashcard: vi.fn(),
    },
    NotFoundError: MockNotFoundError,
  };
});

// Mock logger-service
vi.mock("../../../lib/services/logger-service", () => ({
  loggerService: {
    logError: vi.fn(),
  },
}));

describe("GET /api/flashcards/:id", () => {
  const validUuid = "11111111-1111-1111-1111-111111111111";
  const mockLocals = { user: { id: DEFAULT_USER_ID } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for invalid UUID parameter", async () => {
    const response = await GET({
      params: { id: "invalid-uuid" },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid flashcard ID format");
    expect(loggerService.logError).toHaveBeenCalledWith(DEFAULT_USER_ID, "VALIDATION_FAILED", "Invalid flashcard id");
  });

  it("should return 200 and the flashcard when found", async () => {
    const mockFlashcard = {
      id: validUuid,
      front_content: "Question",
      back_content: "Answer",
      source: "manual",
      ai_metadata: null,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
    };
    (flashcardService.getById as any).mockResolvedValue(mockFlashcard);

    const response = await GET({
      params: { id: validUuid },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockFlashcard);
    expect(loggerService.logError).not.toHaveBeenCalled();
  });

  it("should return 404 when flashcard is not found", async () => {
    const error = new NotFoundError("Flashcard not found");
    (flashcardService.getById as any).mockRejectedValue(error);

    const response = await GET({
      params: { id: validUuid },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Flashcard not found");
    expect(loggerService.logError).toHaveBeenCalledWith(DEFAULT_USER_ID, "NOT_FOUND", "Not found");
  });

  it("should return 500 on generic errors", async () => {
    (flashcardService.getById as any).mockRejectedValue(new Error("DB error"));

    const response = await GET({
      params: { id: validUuid },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("DB error");
    expect(loggerService.logError).toHaveBeenCalledWith(DEFAULT_USER_ID, "INTERNAL_ERROR", "DB error");
  });
});

describe("DELETE /api/flashcards/:id", () => {
  const validUuid = "11111111-1111-1111-1111-111111111111";
  const mockLocals = { user: { id: DEFAULT_USER_ID } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for invalid UUID parameter", async () => {
    const response = await DELETE({
      params: { id: "invalid-uuid" },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid flashcard ID format");
    expect(loggerService.logError).toHaveBeenCalledWith(DEFAULT_USER_ID, "VALIDATION_FAILED", "Invalid flashcard id");
    expect(flashcardService.deleteFlashcard).not.toHaveBeenCalled();
  });

  it("should return 200 when flashcard is successfully deleted", async () => {
    (flashcardService.deleteFlashcard as any).mockResolvedValue(undefined);

    const response = await DELETE({
      params: { id: validUuid },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Flashcard deleted successfully");
    expect(flashcardService.deleteFlashcard).toHaveBeenCalledWith(validUuid, DEFAULT_USER_ID, undefined);
    expect(loggerService.logError).not.toHaveBeenCalled();
  });

  it("should return 404 when flashcard is not found", async () => {
    const error = new NotFoundError("Flashcard not found");
    (flashcardService.deleteFlashcard as any).mockRejectedValue(error);

    const response = await DELETE({
      params: { id: validUuid },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Flashcard not found");
    expect(loggerService.logError).toHaveBeenCalledWith(DEFAULT_USER_ID, "NOT_FOUND", "Flashcard not found");
  });

  it("should return 500 on generic errors", async () => {
    (flashcardService.deleteFlashcard as any).mockRejectedValue(new Error("DB error"));

    const response = await DELETE({
      params: { id: validUuid },
      locals: mockLocals,
    } as any);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("DB error");
    expect(loggerService.logError).toHaveBeenCalledWith(DEFAULT_USER_ID, "INTERNAL_ERROR", "DB error");
  });
});
