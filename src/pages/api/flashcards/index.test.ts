import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, getFlashcardsQuerySchema, POST } from '.';
import { flashcardService } from '../../../lib/services/flashcard-service';
import { loggerService } from '../../../lib/services/logger-service';

// Constants for testing
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Mock database client
vi.mock('../../../db/supabase.client', () => ({
  DEFAULT_USER_ID: '00000000-0000-0000-0000-000000000000',
  supabaseClient: {
    from: vi.fn()
  }
}));

// Mock the services
vi.mock('../../../lib/services/flashcard-service', () => ({
  flashcardService: {
    getUserFlashcards: vi.fn(),
    createFlashcard: vi.fn()
  }
}));

vi.mock('../../../lib/services/logger-service', () => ({
  loggerService: {
    logError: vi.fn()
  }
}));

describe('GET /api/flashcards', () => {
  // Mock Request class for testing
  class MockRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  }
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should validate query parameters correctly', () => {
    // Valid parameters
    expect(getFlashcardsQuerySchema.safeParse({
      page: 2,
      limit: 30,
      sort: 'created_at',
      order: 'asc',
      source: 'ai'
    }).success).toBe(true);
    
    // Default values
    const defaultParams = getFlashcardsQuerySchema.safeParse({});
    expect(defaultParams.success).toBe(true);
    if (defaultParams.success) {
      expect(defaultParams.data).toEqual({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc'
      });
    }
    
    // Invalid values
    expect(getFlashcardsQuerySchema.safeParse({
      page: -1,
      limit: 200,
      sort: 'invalid',
      order: 'invalid',
      source: 'invalid'
    }).success).toBe(false);
  });
  
  it('should return 400 for invalid query parameters', async () => {
    const request = new MockRequest('http://localhost/api/flashcards?page=-1') as unknown as Request;
    const context = { 
      request, 
      locals: { 
        user: { id: DEFAULT_USER_ID } 
      } 
    };
    const response = await GET(context as any);
    
    expect(response.status).toBe(400);
    expect(loggerService.logError).toHaveBeenCalledWith(
      expect.any(String),
      'VALIDATION_FAILED',
      expect.any(String)
    );
  });
  
  it('should return flashcards with 200 status when successful', async () => {
    const mockFlashcards = {
      data: [
        {
          id: '1',
          front_content: 'Front 1',
          back_content: 'Back 1',
          source: 'manual',
          ai_metadata: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 20,
        pages: 1
      }
    };
    
    (flashcardService.getUserFlashcards as any).mockResolvedValue(mockFlashcards);
    
    const request = new MockRequest('http://localhost/api/flashcards') as unknown as Request;
    const context = { 
      request, 
      locals: {
        user: { id: DEFAULT_USER_ID },
        supabase: {} // Add mock Supabase client
      }
    };
    const response = await GET(context as any);
    const responseData = await response.json();
    
    expect(response.status).toBe(200);
    expect(flashcardService.getUserFlashcards).toHaveBeenCalledWith(
      DEFAULT_USER_ID,
      expect.objectContaining({
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc'
      }),
      expect.anything() // For the supabase client parameter
    );
    expect(responseData).toEqual(mockFlashcards);
  });
  
  it('should return 500 when service throws an error', async () => {
    (flashcardService.getUserFlashcards as any).mockRejectedValue(new Error('Database error'));
    
    const request = new MockRequest('http://localhost/api/flashcards') as unknown as Request;
    const context = { 
      request, 
      locals: {
        user: { id: DEFAULT_USER_ID },
        supabase: {}
      }
    };
    const response = await GET(context as any);
    
    expect(response.status).toBe(500);
    expect(loggerService.logError).toHaveBeenCalledWith(
      expect.any(String),
      'INTERNAL_ERROR',
      'Database error'
    );
  });
});

// Unit tests for POST /api/flashcards
describe('POST /api/flashcards', () => {
  class MockRequest {
    private body: any;
    constructor(body: any) { this.body = body; }
    async json() { return this.body; }
  }
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid request body', async () => {
    const invalidBody = { front_content: '', back_content: 'A' };
    const request = new MockRequest(invalidBody) as unknown as Request;
    const context = { 
      request, 
      locals: {
        user: { id: DEFAULT_USER_ID }
      }
    };
    const response = await POST(context as any);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(loggerService.logError).toHaveBeenCalledWith(
      expect.any(String),
      'VALIDATION_FAILED',
      expect.any(String)
    );
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('details');
  });

  it('should create a flashcard and return 201', async () => {
    const newFlashcard = {
      id: '1',
      front_content: 'Front',
      back_content: 'Back',
      source: 'manual',
      ai_metadata: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    (flashcardService.createFlashcard as any).mockResolvedValue(newFlashcard);
    const validBody = { front_content: 'Front', back_content: 'Back' };
    const request = new MockRequest(validBody) as unknown as Request;
    const context = { 
      request, 
      locals: {
        user: { id: DEFAULT_USER_ID },
        supabase: {} // Add mock Supabase client
      }
    };
    const response = await POST(context as any);
    const data = await response.json();
    expect(response.status).toBe(201);
    expect(flashcardService.createFlashcard).toHaveBeenCalledWith(
      { front_content: 'Front', back_content: 'Back' },
      DEFAULT_USER_ID,
      expect.anything() // For the supabase client parameter
    );
    expect(data).toEqual(newFlashcard);
  });

  it('should return 500 when service throws an error', async () => {
    (flashcardService.createFlashcard as any).mockRejectedValue(new Error('DBError'));
    const validBody = { front_content: 'Front', back_content: 'Back' };
    const request = new MockRequest(validBody) as unknown as Request;
    const context = { 
      request, 
      locals: {
        user: { id: DEFAULT_USER_ID },
        supabase: {}
      }
    };
    const response = await POST(context as any);
    expect(response.status).toBe(500);
    expect(loggerService.logError).toHaveBeenCalledWith(
      expect.any(String),
      'INTERNAL_ERROR',
      'DBError'
    );
  });
}); 