# API Endpoint Implementation Plan: POST /api/flashcards/

## 1. Przegląd punktu końcowego

Endpoint służy do zatwierdzania i zapisywania fiszek wygenerowanych przez AI. Umożliwia użytkownikowi zatwierdzanie propozycji fiszek (potencjalnie z modyfikacjami) oraz zapisywanie ich w bazie danych. Fiszki są oznaczane jako pochodzące z AI („ai") lub zmodyfikowane przez użytkownika („semi_ai").

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcards/`
- **Parametry**:
  - **Wymagane**:
    - `flashcards` (array): Tablica obiektów reprezentujących fiszki do zatwierdzenia
      - Każdy obiekt musi zawierać:
        - `front_content` (string): Treść przedniej strony fiszki
        - `back_content` (string): Treść tylnej strony fiszki
        - `ai_metadata` (object): Metadane związane z generowaniem przez AI
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front_content": "string",
        "back_content": "string",
        "ai_metadata": {
          "model": "string",
          "generation_time": "string",
          "parameters": "object"
        }
      }
    ]
  }
  ```

## 3. Wykorzystywane typy

- **DTOs i Command Models**:

  - `ApproveFlashcardsCommand`: Model żądania
    ```typescript
    type ApproveFlashcardsCommand = {
      flashcards: FlashcardCandidate[];
    };
    ```
  - `FlashcardCandidate`: Model pojedynczej propozycji fiszki
    ```typescript
    type FlashcardCandidate = {
      front_content: string;
      back_content: string;
      ai_metadata: {
        model: string;
        generation_time: string;
        parameters: Record<string, unknown>;
      };
    };
    ```
  - `ApproveFlashcardsResponse`: Model odpowiedzi
    ```typescript
    type ApproveFlashcardsResponse = {
      approved: Flashcard[];
      count: number;
    };
    ```
  - `Flashcard`: Model fiszki zapisanej w bazie danych
    ```typescript
    type Flashcard = Omit<Database["public"]["Tables"]["flashcards"]["Row"], "user_id">;
    ```

## 4. Szczegóły odpowiedzi

- **Kody statusu**:

  - `201 Created`: Pomyślne zatwierdzenie i zapisanie fiszek
  - `400 Bad Request`: Nieprawidłowe dane wejściowe
  - `401 Unauthorized`: Użytkownik niezautoryzowany
  - `500 Internal Server Error`: Błąd serwera

- **Struktura odpowiedzi**:
  ```json
  {
    "approved": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "source": "ai", // lub "semi_ai" jeśli zmodyfikowano
        "ai_metadata": "object",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "count": "integer"
  }
  ```

## 5. Przepływ danych

1. Otrzymanie żądania POST z tablicą fiszek do zatwierdzenia
2. Walidacja danych wejściowych za pomocą Zod
3. Dla każdej fiszki:
   - Porównanie z oryginalnymi metadanymi AI, aby ustalić, czy była modyfikowana (źródło: "ai" vs "semi_ai")
   - Utworzenie rekordu w tabeli flashcards z odpowiednim typem źródła
4. Pobranie wszystkich nowo utworzonych fiszek z ich ID i pełnymi danymi
5. Zwrócenie zatwierdzone fiszki z kodem statusu 201

Kluczowe interakcje:

- **Baza danych**: Inserty do tabeli flashcards za pomocą Supabase SDK

## 6. Względy bezpieczeństwa

- **Autoryzacja**:

  - Wykorzystanie RLS (Row Level Security) w Supabase do kontroli dostępu do danych
  - Użytkownicy mogą zatwierdzać i zapisywać fiszki tylko dla własnych kont

- **Walidacja danych**:
  - Dokładna walidacja danych wejściowych za pomocą Zod:
    - Sprawdzenie, czy tablica flashcards nie jest pusta
    - Sprawdzenie, czy każda fiszka ma wymagane pola (front_content, back_content, ai_metadata)
    - Walidacja długości treści front_content i back_content (max 200 znaków)
    - Walidacja struktury ai_metadata

## 7. Obsługa błędów

- **400 Bad Request**:

  - Pusta tablica flashcards
  - Brak wymaganych pól w obiektach fiszek
  - Przekroczenie maksymalnej długości treści (200 znaków)
  - Nieprawidłowy format metadanych AI

- **401 Unauthorized**:

  - Brak tokenu JWT
  - Nieważny token JWT
  - Token JWT wygasł

- **500 Internal Server Error**:
  - Błąd bazy danych podczas zapisywania fiszek
  - Nieoczekiwany błąd serwera

**Obsługa**:

- Wszystkie błędy powinny być odpowiednio zalogowane w tabeli system_logs z kontekstem
- Odpowiedzi błędów powinny zawierać czytelne komunikaty dla użytkownika

## 8. Rozważania dotyczące wydajności

- **Potencjalne wąskie gardła**:

  - Duża liczba fiszek w jednym żądaniu (pojedyncza transakcja)
  - Częste zapytania do bazy danych

- **Strategie optymalizacji**:

  - Użycie transakcji bazy danych dla wielu insertów
  - Implementacja walidacji wsadowej dla szybszego przetwarzania
  - Limit liczby fiszek w jednym żądaniu (np. max 50)

- **Monitorowanie**:
  - Śledzenie czasów odpowiedzi
  - Monitorowanie obciążenia bazy danych
  - Analiza wzorców użycia

## 9. Etapy wdrożenia

### 9.1. Utworzenie struktury plików

1. Utworzenie pliku obsługi endpointu: `src/pages/api/flashcards/index.ts`
2. Utworzenie lub rozszerzenie serwisu fiszek: `src/lib/services/flashcard-service.ts`

### 9.2. Implementacja schematu walidacji

1. Utworzenie schematu Zod dla walidacji danych wejściowych w obsłudze endpointu:

### 9.3. Implementacja serwisu obsługującego fiszki

1. Utworzenie lub modyfikacja serwisu `flashcard-service.ts` z następującymi funkcjami:

2. Implementacja logiki określania źródła fiszki (ai vs semi_ai)

### 9.4. Implementacja obsługi endpointu

1. Implementacja obsługi żądania POST w `src/pages/api/flashcards/index.ts`:

### 9.5. Implementacja funkcji logowania błędów

1. Utworzenie lub modyfikacja funkcji logowania błędów:
