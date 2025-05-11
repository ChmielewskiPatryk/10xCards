import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './generate';
import { generateService, generateFlashcardsSchema } from '../../../lib/services/generate-service';
import { loggerService } from '../../../lib/services/logger-service';

// Mock dependencies
vi.mock('../../../lib/services/generate-service', () => ({
  generateService: { generateFlashcards: vi.fn() },
  generateFlashcardsSchema: { safeParse: vi.fn() }
}));

vi.mock('../../../lib/services/logger-service', () => ({
  loggerService: {
    logError: vi.fn()
  }
}));

vi.mock('../../../db/supabase.client', () => ({
  DEFAULT_USER_ID: '00000000-0000-0000-0000-000000000000',
  openRouterApiKey: 'mock-key',
  openRouterUrl: 'mock-url',
  supabaseClient: {
    from: vi.fn()
  }
}));

describe('POST /api/flashcards/generate', () => {
  let mockRequest: Request;
  let mockContext: any;

  beforeEach(() => {
    vi.resetAllMocks();
    // Set up request
    mockRequest = new Request('https://example.com/api/flashcards/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Sample text'.repeat(20)
      })
    });
    // Set up context with authenticated user
    mockContext = {
      request: mockRequest,
      locals: {
        user: { id: '00000000-0000-0000-0000-000000000000' }
      }
    };
  });

  it('should return 400 when request body is not valid JSON', async () => {
    // Invalid JSON request
    const invalidRequest = new Request('https://example.com/api/flashcards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid-json'
    });
    const invalidContext = { ...mockContext, request: invalidRequest };
    const response = await POST(invalidContext);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Invalid JSON');
  });

  it('should return 200 with generated flashcards when input is valid', async () => {
    const mockGeneratedCards = [
      {
        front_content: 'Question 1',
        back_content: 'Answer 1',
        ai_metadata: { model: 'test-model', generation_time: '100ms', parameters: {} }
      }
    ];
    // Mock validation schema
    vi.mocked(generateFlashcardsSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        source_text: 'Sample text'.repeat(20),
        options: { max_flashcards: 10 }
      }
    });
    // Mock generateService
    vi.mocked(generateService.generateFlashcards).mockResolvedValue(mockGeneratedCards);
    const response = await POST(mockContext);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ flashcards_proposals: mockGeneratedCards });
  });

  it('should return 400 when validation fails', async () => {
    const invalidRequest = new Request('https://example.com/api/flashcards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Too short' })
    });
    const invalidContext = { ...mockContext, request: invalidRequest };
    // Mock validation schema to fail
    vi.mocked(generateFlashcardsSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [{ code: 'custom', message: 'Validation error', path: [] }],
        errors: [{ code: 'custom', message: 'Validation error', path: [] }],
        format: () => ({ _errors: ['Validation error'], source_text: { _errors: ['Validation error'] } }),
        message: 'Validation error',
        isEmpty: false,
        addIssue: () => {},
        addIssues: () => {},
        flatten: () => ({ formErrors: ['Validation error'], fieldErrors: {} }),
        formErrors: { formErrors: ['Validation error'], fieldErrors: {} },
        name: 'ZodError'
      }
    });
    const response = await POST(invalidContext);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Validation error');
  });

  it('should return 500 when AI service is unavailable', async () => {
    vi.mocked(generateFlashcardsSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        source_text: 'Sample text'.repeat(20),
        options: { max_flashcards: 10 }
      }
    });
    vi.mocked(generateService.generateFlashcards).mockRejectedValue(
      new Error('Failed to generate flashcards. AI service unavailable.')
    );
    const response = await POST(mockContext);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Failed to generate flashcards. AI service unavailable.');
  });
}); 