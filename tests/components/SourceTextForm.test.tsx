import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SourceTextForm } from "../../src/components/generate/SourceTextForm";

describe("SourceTextForm", () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it("renders correctly", () => {
    render(<SourceTextForm onSubmit={mockSubmit} isLoading={false} />);

    expect(screen.getByText("Tekst źródłowy")).toBeInTheDocument();
    expect(screen.getByLabelText(/Wprowadź tekst, z którego chcesz wygenerować fiszki/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maksymalna liczba fiszek/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generuj fiszki/i })).toBeInTheDocument();
  });

  it("updates character count when typing", async () => {
    render(<SourceTextForm onSubmit={mockSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/Wprowadź tekst, z którego chcesz wygenerować fiszki/i);
    await userEvent.type(textarea, "Test text");

    // Czekamy na zaktualizowanie licznika znaków
    await waitFor(() => {
      expect(screen.getByText(/9 \/ 10000 znaków/i)).toBeInTheDocument();
    });
  });

  it("shows error when text is too short", async () => {
    render(<SourceTextForm onSubmit={mockSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/Wprowadź tekst, z którego chcesz wygenerować fiszki/i);
    await userEvent.type(textarea, "Short text");

    // Sprawdzamy czy istnieje element z alertem
    await waitFor(() => {
      const alertElement = screen.getByRole("alert", { hidden: true });
      expect(alertElement).toBeInTheDocument();
    });
  });

  it("disables submit button when text is too short", async () => {
    render(<SourceTextForm onSubmit={mockSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/Wprowadź tekst, z którego chcesz wygenerować fiszki/i);
    const submitButton = screen.getByRole("button", { name: /Generuj fiszki/i });

    // Na początku przycisk powinien być nieaktywny (tekst jest pusty)
    expect(submitButton).toBeDisabled();

    // Dodajemy trochę tekstu, ale za mało
    await userEvent.type(textarea, "Test text");
    expect(submitButton).toBeDisabled();
  });

  it("validates maximum flashcards correctly", async () => {
    render(<SourceTextForm onSubmit={mockSubmit} isLoading={false} />);

    // Use a shorter text to avoid timeouts (1000 characters is enough for validation)
    const textarea = screen.getByLabelText(/Wprowadź tekst, z którego chcesz wygenerować fiszki/i);
    const text = "a".repeat(1000);
    await userEvent.clear(textarea);
    await userEvent.paste(text); // Use paste instead of type for better performance

    // Wprowadzamy nieprawidłową liczbę fiszek
    const input = screen.getByLabelText(/Maksymalna liczba fiszek/i);
    await userEvent.clear(input);
    await userEvent.type(input, "50");

    // Sprawdzamy czy pojawił się komunikat o błędzie - reduce timeout to avoid test timeout
    await waitFor(
      () => {
        expect(screen.getByText(/Maksymalna liczba fiszek to 30/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("submits form with valid data", async () => {
    render(<SourceTextForm onSubmit={mockSubmit} isLoading={false} />);

    // Use a shorter text to avoid timeouts
    const textarea = screen.getByLabelText(/Wprowadź tekst, z którego chcesz wygenerować fiszki/i);
    const text = "a".repeat(1000);
    await userEvent.clear(textarea);
    await userEvent.paste(text); // Use paste instead of type for better performance

    // Wprowadzamy poprawną liczbę fiszek
    const input = screen.getByLabelText(/Maksymalna liczba fiszek/i);
    await userEvent.clear(input);
    await userEvent.type(input, "15");

    // Sprawdzamy czy przycisk jest aktywny - reduce timeout to avoid test timeout
    const submitButton = screen.getByRole("button", { name: /Generuj fiszki/i });
    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 1000 }
    );

    // Wysyłamy formularz
    await userEvent.click(submitButton);

    // Sprawdzamy czy funkcja onSubmit została wywołana z poprawnymi danymi
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      source_text: text,
      options: {
        max_flashcards: 15,
      },
    });
  });

  it("disables submit button and shows loading state when isLoading is true", () => {
    render(<SourceTextForm onSubmit={mockSubmit} isLoading={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Generowanie...");
  });
});
