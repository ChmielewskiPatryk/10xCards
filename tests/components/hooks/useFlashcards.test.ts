import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFlashcards } from "../../../src/components/hooks/useFlashcards";
import type { Filters } from "../../../src/components/hooks/useFlashcards";
import type { Flashcard, PaginatedResponse } from "../../../src/types";

// Mock fetch API
global.fetch = vi.fn();

describe("useFlashcards", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const defaultFilters: Filters = {
    source: "manual",
    sort: "created_at",
    order: "desc",
  };

  const mockFlashcards: Flashcard[] = [
    {
      id: "1",
      front_content: "Question 1",
      back_content: "Answer 1",
      source: "manual",
      ai_metadata: null,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "2",
      front_content: "Question 2",
      back_content: "Answer 2",
      source: "manual",
      ai_metadata: null,
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
    },
  ];

  const mockResponse: PaginatedResponse<Flashcard> = {
    data: mockFlashcards,
    pagination: {
      total: 10,
      page: 1,
      limit: 20,
      pages: 1,
    },
  };

  it("should initialize with loading state", async () => {
    const { result } = renderHook(() => useFlashcards(defaultFilters, 1));

    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toEqual({
      total: 0,
      page: 1,
      limit: 20,
      pages: 0,
    });
  });

  it("should fetch data on mount and update state correctly", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useFlashcards(defaultFilters, 1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/flashcards?page=1&limit=20&sort=created_at&order=desc&source=manual"),
      { credentials: "include" }
    );

    expect(result.current.data).toEqual(mockFlashcards);
    expect(result.current.pagination).toEqual(mockResponse.pagination);
    expect(result.current.error).toBeNull();
  });

  it("should handle API errors correctly", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const { result } = renderHook(() => useFlashcards(defaultFilters, 1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("HTTP 500: Internal Server Error");
    expect(result.current.data).toEqual([]);
  });

  it("should refetch data when filters change", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          data: [mockFlashcards[0]],
        }),
      });

    const { result, rerender } = renderHook(({ filters, page }) => useFlashcards(filters, page), {
      initialProps: { filters: defaultFilters, page: 1 },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockFlashcards);

    // Change filters and rerender
    rerender({
      filters: { ...defaultFilters, source: "semi_ai" },
      page: 1,
    });

    // Should be loading again
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Check that the second fetch was called with updated params
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("/api/flashcards?page=1&limit=20&sort=created_at&order=desc&source=semi_ai"),
      { credentials: "include" }
    );
  });

  it("should refetch data when page changes", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          pagination: { ...mockResponse.pagination, page: 2 },
        }),
      });

    const { result, rerender } = renderHook(({ filters, page }) => useFlashcards(filters, page), {
      initialProps: { filters: defaultFilters, page: 1 },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Change page and rerender
    rerender({ filters: defaultFilters, page: 2 });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(expect.stringContaining("/api/flashcards?page=2"), {
      credentials: "include",
    });

    expect(result.current.pagination.page).toBe(2);
  });

  it("should allow manual refresh", async () => {
    const updatedMockResponse = {
      ...mockResponse,
      data: [
        {
          ...mockFlashcards[0],
          front_content: "Updated Question 1",
        },
        mockFlashcards[1],
      ],
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedMockResponse,
      });

    const { result } = renderHook(() => useFlashcards(defaultFilters, 1));

    // Wait for initial data load
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0].front_content).toBe("Question 1");

    // Manually refresh
    await act(async () => {
      await result.current.refresh();
    });

    // Wait for the refresh to complete and state to update
    await waitFor(() => {
      expect(result.current.data[0].front_content).toBe("Updated Question 1");
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
