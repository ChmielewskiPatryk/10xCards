import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock both modules before importing
vi.mock('../../../db/supabase.client', () => ({
  supabaseClient: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis()
  },
  DEFAULT_USER_ID: '00000000-0000-0000-0000-000000000000'
}));

vi.mock('../../../lib/services/flashcard-service', () => ({
  flashcardService: {
    approveFlashcards: vi.fn()
  }
}));

vi.mock('../../../lib/services/logger-service', () => ({
  loggerService: {
    logError: vi.fn()
  }
}));

// Mock the Response object
vi.mock('astro', async () => {
  const actual = await vi.importActual('astro');
  return {
    ...actual,
    APIRoute: vi.fn()
  };
});

// Now import the mocked modules
import { flashcardService } from '../../../lib/services/flashcard-service';
import { loggerService } from '../../../lib/services/logger-service';
import { DEFAULT_USER_ID } from '../../../db/supabase.client';

// Import after mocking
import { POST } from './saveFlashcards';

describe('POST /api/flashcards', () => {
  let mockRequest: Request;
  let mockContext: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept empty flashcards array', async () => {
    // Create request with empty flashcards array
    mockRequest = new Request('http://localhost:3000/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcards: [] })
    });

    // Mock context with user
    mockContext = {
      request: mockRequest,
      locals: {
        user: { id: DEFAULT_USER_ID }
      }
    };

    // Mock flashcard service to return empty result
    const emptyResult = {
      approved: [],
      count: 0
    };
    (flashcardService.approveFlashcards as any).mockResolvedValue(emptyResult);
    
    // Call the endpoint
    const response = await POST(mockContext);
    
    // Check the status directly - the schema allows empty arrays
    expect(response.status).toBe(200);
    
    // Get response text, then parse manually to avoid potential issues
    const responseText = await response.text();
    const responseBody = JSON.parse(responseText);
    
    // Assertions
    expect(responseBody).toEqual(emptyResult);
    expect(flashcardService.approveFlashcards).toHaveBeenCalledWith(
      { flashcards: [] },
      DEFAULT_USER_ID,
      undefined
    );
  });

  it('should return 400 for invalid flashcard data', async () => {
    // Create request with invalid flashcard data (missing back_content)
    mockRequest = new Request('http://localhost:3000/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flashcards: [{
          front_content: 'Test question',
          // Missing back_content field
          ai_metadata: {
            model: 'test-model',
            generation_time: '100ms',
            parameters: {}
          }
        }]
      })
    });

    // Mock context with user
    mockContext = {
      request: mockRequest,
      locals: {
        user: { id: DEFAULT_USER_ID }
      }
    };

    // Mock logger service to resolve
    (loggerService.logError as any).mockResolvedValue(undefined);
    
    // Call the endpoint
    const response = await POST(mockContext);
    
    // Check status code directly
    expect(response.status).toBe(400);
    
    // Get response text, then parse manually to avoid potential issues
    const responseText = await response.text();
    const responseBody = JSON.parse(responseText);
    
    // Assertions
    expect(responseBody.error).toBe('Validation error in request body');
    expect(loggerService.logError).toHaveBeenCalled();
  });

  it('should return 200 for valid flashcard data', async () => {
    // Mock successful approval result
    const mockApprovalResult = {
      approved: [
        {
          id: 'test-id-1',
          front_content: 'Test question 1',
          back_content: 'Test answer 1',
          source: 'ai',
          ai_metadata: { model: 'test-model' },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ],
      count: 1
    };

    // Setup mock implementation
    (flashcardService.approveFlashcards as any).mockResolvedValue(mockApprovalResult);

    // Create request with valid flashcard data
    mockRequest = new Request('http://localhost:3000/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flashcards: [{
          front_content: 'Test question 1',
          back_content: 'Test answer 1',
          ai_metadata: {
            model: 'test-model',
            generation_time: '100ms',
            parameters: {}
          }
        }]
      })
    });

    // Mock context with user
    mockContext = {
      request: mockRequest,
      locals: {
        user: { id: DEFAULT_USER_ID },
        supabase: {} // Mock supabase client
      }
    };
    
    // Call the endpoint
    const response = await POST(mockContext);
    
    // Assert status code
    expect(response.status).toBe(200);
    
    // Get response text, then parse manually
    const responseText = await response.text();
    const responseBody = JSON.parse(responseText);
    
    // Assertions
    expect(responseBody).toEqual(mockApprovalResult);
    expect(flashcardService.approveFlashcards).toHaveBeenCalledWith(
      expect.objectContaining({
        flashcards: [expect.objectContaining({
          front_content: 'Test question 1',
          back_content: 'Test answer 1'
        })]
      }),
      DEFAULT_USER_ID,
      expect.anything()
    );
  });

  it('should return 500 when an error occurs', async () => {
    // Mock an error during flashcard approval
    const testError = new Error('Test error');
    (flashcardService.approveFlashcards as any).mockRejectedValue(testError);

    // Create request with valid flashcard data
    mockRequest = new Request('http://localhost:3000/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flashcards: [{
          front_content: 'Test question 1',
          back_content: 'Test answer 1',
          ai_metadata: {
            model: 'test-model',
            generation_time: '100ms',
            parameters: {}
          }
        }]
      })
    });

    // Mock context with user
    mockContext = {
      request: mockRequest,
      locals: {
        user: { id: DEFAULT_USER_ID },
        supabase: {} // Mock supabase client
      }
    };
    
    // Call the endpoint
    const response = await POST(mockContext);
    
    // Assert status code
    expect(response.status).toBe(500);
    
    // Get response text, then parse manually
    const responseText = await response.text();
    const responseBody = JSON.parse(responseText);
    
    // Assertions
    expect(responseBody.error).toBe('Test error');
    expect(loggerService.logError).toHaveBeenCalledWith(
      DEFAULT_USER_ID,
      'INTERNAL_ERROR',
      'Test error'
    );
  });
}); 