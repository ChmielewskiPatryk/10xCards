import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseClient } from '../../db/supabase.client';
import { flashcardService, NotFoundError } from './flashcard-service';
import type { CreateFlashcardCommand, Flashcard } from '../../types';

// Mock the supabase client
vi.mock('../../db/supabase.client', () => ({
  supabaseClient: {
    from: vi.fn()
  }
}));

describe('FlashcardService.createFlashcard', () => {
  const userId = 'test-user-id';
  const command: CreateFlashcardCommand = {
    front_content: 'Front text',
    back_content: 'Back text'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create and return a flashcard when supabase returns data without error', async () => {
    const expectedFlashcard: Flashcard = {
      id: '1',
      front_content: 'Front text',
      back_content: 'Back text',
      source: 'manual',
      ai_metadata: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    // Mock the chain: from().insert().select().single()
    const singleMock = vi.fn().mockResolvedValue({ data: expectedFlashcard, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    (supabaseClient.from as any).mockReturnValue({ insert: insertMock });

    const result = await flashcardService.createFlashcard(command, userId);

    expect(supabaseClient.from).toHaveBeenCalledWith('flashcards');
    expect(insertMock).toHaveBeenCalledWith([{ front_content: command.front_content, back_content: command.back_content, user_id: userId }]);
    expect(selectMock).toHaveBeenCalled();
    expect(singleMock).toHaveBeenCalled();
    expect(result).toEqual(expectedFlashcard);
  });

  it('should throw an error when supabase returns an error', async () => {
    const singleErrorMock = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') });
    const selectErrorMock = vi.fn().mockReturnValue({ single: singleErrorMock });
    const insertErrorMock = vi.fn().mockReturnValue({ select: selectErrorMock });
    (supabaseClient.from as any).mockReturnValue({ insert: insertErrorMock });

    await expect(flashcardService.createFlashcard(command, userId)).rejects.toThrow('DB error');
  });
});

describe('FlashcardService.deleteFlashcard', () => {
  const userId = 'test-user-id';
  const flashcardId = 'test-flashcard-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete flashcard when it exists and belongs to the user', async () => {
    // Mock the check if flashcard exists
    const singleGetMock = vi.fn().mockResolvedValue({ 
      data: { id: flashcardId }, 
      error: null 
    });
    const eqUserIdMock = vi.fn().mockReturnValue({ single: singleGetMock });
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqUserIdMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqIdMock });
    
    // Mock the delete operation
    const deleteMock = vi.fn().mockResolvedValue({ error: null });
    const eqUserIdDeleteMock = vi.fn().mockReturnValue({ 
      ...vi.fn().mockResolvedValue({ error: null })
    });
    const eqIdDeleteMock = vi.fn().mockReturnValue({ eq: eqUserIdDeleteMock });
    
    // Set up the from() mock to return different chains based on the operation
    (supabaseClient.from as any).mockImplementation((table) => {
      expect(table).toBe('flashcards');
      return {
        select: selectMock,
        delete: vi.fn().mockReturnValue({ eq: eqIdDeleteMock })
      };
    });

    await flashcardService.deleteFlashcard(flashcardId, userId);

    // Verify select query was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('flashcards');
    expect(selectMock).toHaveBeenCalledWith('id');
    expect(eqIdMock).toHaveBeenCalledWith('id', flashcardId);
    expect(eqUserIdMock).toHaveBeenCalledWith('user_id', userId);
    expect(singleGetMock).toHaveBeenCalled();
    
    // Verify delete was called
    expect(supabaseClient.from).toHaveBeenCalledWith('flashcards');
  });

  it('should throw NotFoundError when flashcard does not exist', async () => {
    // Mock the supabase response for non-existent flashcard
    const singleMock = vi.fn().mockResolvedValue({ 
      data: null, 
      error: { 
        code: 'PGRST116', 
        message: 'No rows returned' 
      } 
    });
    const eqUserIdMock = vi.fn().mockReturnValue({ single: singleMock });
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqUserIdMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqIdMock });
    (supabaseClient.from as any).mockReturnValue({ select: selectMock });

    await expect(flashcardService.deleteFlashcard(flashcardId, userId))
      .rejects.toThrow(NotFoundError);

    expect(supabaseClient.from).toHaveBeenCalledWith('flashcards');
    expect(selectMock).toHaveBeenCalledWith('id');
    expect(eqIdMock).toHaveBeenCalledWith('id', flashcardId);
    expect(eqUserIdMock).toHaveBeenCalledWith('user_id', userId);
  });

  it('should throw error when delete operation fails', async () => {
    // Mock successful flashcard existence check
    const singleGetMock = vi.fn().mockResolvedValue({ 
      data: { id: flashcardId }, 
      error: null 
    });
    const eqUserIdMock = vi.fn().mockReturnValue({ single: singleGetMock });
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqUserIdMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqIdMock });
    
    // Mock failed delete operation
    const deleteError = new Error('Delete operation failed');
    const eqUserIdDeleteMock = vi.fn().mockReturnValue({ 
      ...vi.fn().mockResolvedValue({ error: deleteError })
    });
    const eqIdDeleteMock = vi.fn().mockReturnValue({ eq: eqUserIdDeleteMock });
    
    // Set up the from() mock with different implementations
    let callCount = 0;
    (supabaseClient.from as any).mockImplementation((table) => {
      expect(table).toBe('flashcards');
      callCount++;
      
      if (callCount === 1) {
        // First call - for checking flashcard existence
        return { select: selectMock };
      } else {
        // Second call - for delete operation
        return { 
          delete: vi.fn().mockReturnValue({ 
            eq: vi.fn().mockReturnValue({ 
              eq: vi.fn().mockResolvedValue({ error: deleteError }) 
            }) 
          }) 
        };
      }
    });

    await expect(flashcardService.deleteFlashcard(flashcardId, userId))
      .rejects.toThrow('Failed to delete flashcard');
  });
}); 