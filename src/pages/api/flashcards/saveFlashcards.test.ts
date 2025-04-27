import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './saveFlashcards';

// Mock the supabase client and flashcard service
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

// Import the mocked services after mocking
import { supabaseClient, DEFAULT_USER_ID } from '../../../db/supabase.client';
import { flashcardService } from '../../../lib/services/flashcard-service';
import { loggerService } from '../../../lib/services/logger-service';

describe('POST /api/flashcards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for empty flashcards array', async () => {
    // Create a mock request with empty flashcards array
    const request = new Request('http://localhost:3000/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcards: [] })
    });

    // Call the endpoint
    const response = await POST({ request } as any);
    const responseBody = await response.json();

    // Assertions
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Invalid request body');
    expect(loggerService.logError).toHaveBeenCalledWith(
      DEFAULT_USER_ID,
      'VALIDATION_FAILED', 
      'Invalid flashcard data format'
    );
  });

  it('should return 400 for invalid flashcard data', async () => {
    // Create a mock request with invalid flashcard data (missing back_content)
    const request = new Request('http://localhost:3000/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flashcards: [{
          front_content: 'Test question',
          // Missing back_content
          ai_metadata: {
            model: 'test-model',
            generation_time: '100ms',
            parameters: {}
          }
        }]
      })
    });

    // Call the endpoint
    const response = await POST({ request } as any);
    const responseBody = await response.json();

    // Assertions
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Invalid request body');
    expect(loggerService.logError).toHaveBeenCalled();
  });

  it('should return 201 for valid flashcard data', async () => {
    // Mock successful approval
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

    (flashcardService.approveFlashcards as any).mockResolvedValue(mockApprovalResult);

    // Create a mock request with valid flashcard data
    const request = new Request('http://localhost:3000/api/flashcards', {
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

    // Call the endpoint
    const response = await POST({ request } as any);
    const responseBody = await response.json();

    // Assertions
    expect(response.status).toBe(201);
    expect(responseBody).toEqual(mockApprovalResult);

    // Verify service was called with correct parameters
    expect(flashcardService.approveFlashcards).toHaveBeenCalledWith(
      expect.objectContaining({
        flashcards: [expect.objectContaining({
          front_content: 'Test question 1',
          back_content: 'Test answer 1'
        })]
      }),
      DEFAULT_USER_ID
    );
  });

  it('should return 500 when an error occurs', async () => {
    // Mock an error during approval
    (flashcardService.approveFlashcards as any).mockRejectedValue(new Error('Test error'));

    // Create a mock request with valid flashcard data
    const request = new Request('http://localhost:3000/api/flashcards', {
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

    // Call the endpoint
    const response = await POST({ request } as any);
    const responseBody = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('Internal server error');

    // Verify error was logged
    expect(loggerService.logError).toHaveBeenCalledWith(
      DEFAULT_USER_ID,
      'FLASHCARD_APPROVAL_ERROR',
      'Failed to approve flashcards: Test error'
    );
  });
}); 