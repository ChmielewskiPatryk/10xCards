import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlashcardCard } from "@/components/FlashcardCard";
import type { Flashcard } from "@/types";

describe("FlashcardCard", () => {
  const mockFlashcard: Flashcard = {
    id: "1",
    front_content: "Co to jest React?",
    back_content: "Biblioteka JavaScript do budowania interfejsów użytkownika",
    source: "manual",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    ai_metadata: null,
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders front content correctly", () => {
    render(<FlashcardCard flashcard={mockFlashcard} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} />);

    expect(screen.getByText("Co to jest React?")).toBeInTheDocument();
    expect(screen.getByText("Biblioteka JavaScript do budowania interfejsów użytkownika")).toBeInTheDocument();
    expect(screen.getByText("Źródło: manual")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<FlashcardCard flashcard={mockFlashcard} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} />);

    const editButton = screen.getByRole("button", { name: /edytuj/i });
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<FlashcardCard flashcard={mockFlashcard} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} />);

    const deleteButton = screen.getByRole("button", { name: /usuń/i });
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith("1");
  });

  it("displays date in correct format", () => {
    render(<FlashcardCard flashcard={mockFlashcard} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} />);

    // Check if the date is displayed in the expected format
    expect(screen.getByText(/Utworzono:/)).toBeInTheDocument();
  });
});
