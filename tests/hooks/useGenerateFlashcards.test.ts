import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGenerateFlashcards } from '../../src/components/hooks/useGenerateFlashcards';

// Mock dla fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useGenerateFlashcards', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    expect(result.current.formData).toEqual({
      source_text: '',
      options: {
        max_flashcards: 10
      }
    });
    expect(result.current.generationState).toEqual({
      status: 'idle',
      flashcards: [],
      error: null,
      startTime: null
    });
  });

  it('should handle form submission and generation success', async () => {
    // Przygotowanie odpowiedzi z API
    const mockResponse = {
      flashcards_proposals: [
        {
          front_content: 'Test Question 1',
          back_content: 'Test Answer 1',
          ai_metadata: {
            model: 'test',
            generation_time: '2023-01-01',
            parameters: {}
          }
        },
        {
          front_content: 'Test Question 2',
          back_content: 'Test Answer 2',
          ai_metadata: {
            model: 'test',
            generation_time: '2023-01-01',
            parameters: {}
          }
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useGenerateFlashcards());

    // Wywołanie funkcji handleFormSubmit
    await act(async () => {
      await result.current.handleFormSubmit({
        source_text: 'Test text with at least 1000 characters...',
        options: {
          max_flashcards: 5
        }
      });
    });

    // Sprawdzenie czy fetch został wywołany z odpowiednimi parametrami
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/flashcards/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      })
    );

    // Sprawdzenie stanu po pomyślnym generowaniu
    expect(result.current.generationState.status).toBe('success');
    expect(result.current.generationState.flashcards).toHaveLength(2);
    expect(result.current.generationState.flashcards[0]).toEqual(
      expect.objectContaining({
        front_content: 'Test Question 1',
        back_content: 'Test Answer 1',
        isSelected: false,
        isEditing: false,
        wasEdited: false
      })
    );
  });

  it('should handle API errors correctly', async () => {
    // Przygotowanie błędu z API
    const errorMessage = 'Server error';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage })
    });

    const { result } = renderHook(() => useGenerateFlashcards());

    // Wywołanie funkcji handleFormSubmit
    await act(async () => {
      await result.current.handleFormSubmit({
        source_text: 'Test text with at least 1000 characters...',
        options: {
          max_flashcards: 5
        }
      });
    });

    // Sprawdzenie stanu błędu
    expect(result.current.generationState.status).toBe('error');
    expect(result.current.generationState.error).toBe(errorMessage);
  });

  it('should handle selecting, editing and rejecting flashcards correctly', () => {
    // Przygotowanie stanu z fiszkami
    const { result } = renderHook(() => useGenerateFlashcards());
    const mockFlashcards = [
      {
        front_content: 'Test Question 1',
        back_content: 'Test Answer 1',
        ai_metadata: {
          model: 'test',
          generation_time: '2023-01-01',
          parameters: {}
        },
        isSelected: false,
        isEditing: false,
        wasEdited: false
      },
      {
        front_content: 'Test Question 2',
        back_content: 'Test Answer 2',
        ai_metadata: {
          model: 'test',
          generation_time: '2023-01-01',
          parameters: {}
        },
        isSelected: false,
        isEditing: false,
        wasEdited: false
      }
    ];
    
    // Ustawiamy stan na success z przykładowymi fiszkami
    act(() => {
      result.current.generationState.status = 'success';
      result.current.generationState.flashcards = mockFlashcards;
    });

    // Test zaznaczania fiszki
    act(() => {
      result.current.handleSelectFlashcard(0);
    });
    expect(result.current.generationState.flashcards[0].isSelected).toBe(true);
    expect(result.current.generationState.flashcards[1].isSelected).toBe(false);

    // Test edycji fiszki
    act(() => {
      result.current.handleEditFlashcard(1);
    });
    expect(result.current.generationState.flashcards[1].isEditing).toBe(true);

    // Test zapisywania edytowanej fiszki
    const updatedFlashcard = {
      front_content: 'Updated Question',
      back_content: 'Updated Answer',
      ai_metadata: mockFlashcards[1].ai_metadata
    };
    act(() => {
      result.current.handleSaveEditedFlashcard(1, updatedFlashcard);
    });
    expect(result.current.generationState.flashcards[1].front_content).toBe('Updated Question');
    expect(result.current.generationState.flashcards[1].back_content).toBe('Updated Answer');
    expect(result.current.generationState.flashcards[1].isEditing).toBe(false);
    expect(result.current.generationState.flashcards[1].wasEdited).toBe(true);
    expect(result.current.generationState.flashcards[1].isSelected).toBe(true);

    // Test anulowania edycji
    act(() => {
      result.current.handleEditFlashcard(0);
    });
    expect(result.current.generationState.flashcards[0].isEditing).toBe(true);
    act(() => {
      result.current.handleCancelEdit(0);
    });
    expect(result.current.generationState.flashcards[0].isEditing).toBe(false);

    // Test odrzucania fiszki
    act(() => {
      result.current.handleRejectFlashcard(1);
    });
    expect(result.current.generationState.flashcards).toHaveLength(1);
    expect(result.current.generationState.flashcards[0].front_content).toBe('Test Question 1');
  });

  it('should handle saving selected flashcards', async () => {
    // Przygotowanie odpowiedzi z API
    const mockResponseData = {
      approved: [
        {
          id: 'test-id-1',
          front_content: 'Test Question 1',
          back_content: 'Test Answer 1',
          source: 'ai',
          ai_metadata: {},
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ],
      count: 1
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponseData
    });

    // Przygotowanie stanu z wybranymi fiszkami
    const { result } = renderHook(() => useGenerateFlashcards());
    act(() => {
      result.current.generationState.status = 'success';
      result.current.generationState.flashcards = [
        {
          front_content: 'Test Question 1',
          back_content: 'Test Answer 1',
          ai_metadata: {
            model: 'test',
            generation_time: '2023-01-01',
            parameters: {}
          },
          isSelected: true,
          isEditing: false,
          wasEdited: false
        },
        {
          front_content: 'Test Question 2',
          back_content: 'Test Answer 2',
          ai_metadata: {
            model: 'test',
            generation_time: '2023-01-01',
            parameters: {}
          },
          isSelected: false,
          isEditing: false,
          wasEdited: false
        }
      ];
    });

    // Wywołanie funkcji handleSaveSelectedFlashcards
    let response;
    await act(async () => {
      response = await result.current.handleSaveSelectedFlashcards();
    });

    // Sprawdzenie czy fetch został wywołany z odpowiednimi parametrami
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/flashcards/saveFlashcards',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test Question 1')
      })
    );

    // Sprawdzenie odpowiedzi
    expect(response).toEqual(mockResponseData);

    // Sprawdzenie czy stan został zresetowany
    expect(result.current.generationState.status).toBe('idle');
    expect(result.current.generationState.flashcards).toHaveLength(0);
  });

  it('should handle reset of state correctly', () => {
    const { result } = renderHook(() => useGenerateFlashcards());

    // Zmieniamy stan na "loading"
    act(() => {
      result.current.generationState.status = 'loading';
      result.current.generationState.startTime = Date.now();
    });

    // Anulujemy generowanie
    act(() => {
      result.current.handleCancel();
    });

    // Sprawdzenie czy stan został zresetowany
    expect(result.current.generationState).toEqual({
      status: 'idle',
      flashcards: [],
      error: null,
      startTime: null
    });
  });
}); 