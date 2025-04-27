import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './generate';
import { generateFlashcardsSchema, generateService } from '../../../lib/services/generate-service';

// Mock dependencies
vi.mock('../../../lib/services/generate-service', () => ({
  generateService: {
    generateFlashcards: vi.fn()
  },
  generateFlashcardsSchema: {
    safeParse: vi.fn()
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
        source_text: 'Sample text'.repeat(100),
        options: { max_flashcards: 5 }
      })
    });
    
    // Set up context
    mockContext = {
      request: mockRequest,
      locals: {}
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
    expect(body.error).toBe('Invalid JSON in request body');
  });

  it('should return 200 with flashcard proposals when input is valid', async () => {
    // Mock validation success
    vi.mocked(generateFlashcardsSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        source_text: 'Sample text'.repeat(100),
        options: { max_flashcards: 5 }
      }
    });

    // Mock generate service
    vi.mocked(generateService.generateFlashcards).mockResolvedValue([
      {
        front_content: 'Question 1',
        back_content: 'Answer 1',
        ai_metadata: { model: 'test-model', generation_time: '100ms', parameters: {} }
      }
    ]);

    const response = await POST(mockContext);
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('flashcards_proposals');
    expect(body.flashcards_proposals).toHaveLength(1);
  });

  it('should return 400 when validation fails', async () => {
    // Mock validation failure
    vi.mocked(generateFlashcardsSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        format: () => ({
          source_text: { _errors: ['Text too short'] }
        })
      }
    });

    const response = await POST(mockContext);
    
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Validation error');
  });

  it('should return 503 when AI service is unavailable', async () => {
    // Mock validation success
    vi.mocked(generateFlashcardsSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        source_text: 'Sample text'.repeat(100),
        options: { max_flashcards: 5 }
      }
    });

    // But service throws error
    vi.mocked(generateService.generateFlashcards).mockRejectedValue(
      new Error('Failed to generate flashcards. AI service unavailable.')
    );

    const response = await POST(mockContext);
    
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe('Failed to generate flashcards. AI service unavailable.');
  });
}); 