# API Endpoint Implementation Plan: POST /api/flashcards/generate

## 1. Przegląd punktu końcowego

Endpoint służy do automatycznego generowania propozycji fiszek za pomocą AI na podstawie dostarczonego tekstu źródłowego. Użytkownik dostarcza tekst źródłowy, a system zwraca zestaw propozycji fiszek zawierających treść frontu, tyłu oraz metadane dotyczące procesu generowania przez AI.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcards/generate`
- **Parametry**:
  - **Wymagane**:
    - `source_text` (string): Tekst źródłowy, na podstawie którego AI wygeneruje propozycje fiszek
  - **Opcjonalne**:
    - `options.max_flashcards` (integer): Maksymalna liczba fiszek do wygenerowania (domyślnie: 10)
- **Request Body**:
  ```json
  {
    "source_text": "string",
    "options": {
      "max_flashcards": "integer" // Opcjonalny, domyślnie: 10
    }
  }
  ```

## 3. Wykorzystywane typy

- **DTOs i Command Models**:

  - `GenerateFlashcardsCommand`: Model żądania
    ```typescript
    type GenerateFlashcardsCommand = {
      source_text: string;
      options?: {
        max_flashcards?: number;
      };
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
  - `GenerateFlashcardsResponse`: Model odpowiedzi
    ```typescript
    type GenerateFlashcardsResponse = {
      flashcards_proposals: FlashcardCandidate[];
    };
    ```

## 4. Szczegóły odpowiedzi

- **Kody statusu**:

  - `200 OK`: Pomyślne wygenerowanie propozycji fiszek
  - `400 Bad Request`: Nieprawidłowe dane wejściowe (np. tekst zbyt krótki)
  - `401 Unauthorized`: Użytkownik niezautoryzowany
  - `429 Too Many Requests`: Przekroczono limit zapytań
  - `500 Internal Server Error`: Błąd serwera lub usługi AI

- **Struktura odpowiedzi**:
  ```json
  {
    "flashcards_proposals": [
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

## 5. Przepływ danych

1. Otrzymanie żądania POST z tekstem źródłowym i opcjonalnymi parametrami
2. Walidacja danych wejściowych za pomocą Zod (minimum 1000 znaków, max 10000 znaków)
3. Autoryzacja użytkownika za pomocą Supabase
4. Wywołanie zewnętrznej usługi AI (Openrouter.ai) z odpowiednio sformułowanym promptem
5. Przetworzenie odpowiedzi od AI na strukturę propozycji fiszek
6. Zwrócenie sformatowanej odpowiedzi

Kluczowe interakcje:

- **Autentykacja**: Supabase dla weryfikacji JWT i dostępu do danych użytkownika
- **Zewnętrzna usługa AI**: Openrouter.ai dla generowania fiszek
- **Baza danych**: Opcjonalnie sprawdzenie limitów użycia (dla rate limiting)

## 6. Względy bezpieczeństwa

- **Autentykacja**:

  - Wykorzystanie Supabase Auth do weryfikacji JWT użytkownika
  - Dostęp tylko dla zalogowanych użytkowników

- **Autoryzacja**:

  - Użytkownicy mogą generować fiszki tylko dla własnych kont

- **Walidacja danych**:
  - Dokładna walidacja danych wejściowych za pomocą Zod (minimum 1000 znaków, max 10000 znaków)
  - Minimalna wymagana długość tekstu źródłowego (np. 1000 znaków)

## 7. Obsługa błędów

- **400 Bad Request**:

  - Tekst źródłowy jest pusty
  - Tekst źródłowy jest zbyt krótki (np. < 50 znaków)
  - Parametr max_flashcards poza dozwolonym zakresem (np. < 1 lub > 30)

- **401 Unauthorized**:

  - Brak tokenu JWT
  - Nieważny token JWT
  - Token JWT wygasł

- **429 Too Many Requests**:

  - Przekroczono dzienny limit zapytań do AI dla użytkownika
  - Przekroczono globalny limit zapytań do usługi Openrouter.ai

- **500 Internal Server Error**:
  - Usługa AI (Openrouter.ai) niedostępna
  - Usługa AI zwróciła nieoczekiwany format odpowiedzi
  - Nieoczekiwany błąd serwera

**Obsługa**:

- Wszystkie błędy powinny być odpowiednio zalogowane (z kontekstem, ale bez danych wrażliwych)
- Odpowiedzi błędów powinny zawierać czytelne komunikaty dla użytkownika

## 8. Rozważania dotyczące wydajności

- **Potencjalne wąskie gardła**:

  - Czas odpowiedzi zewnętrznej usługi AI (Openrouter.ai)
  - Limity przepustowości usługi Openrouter.ai

- **Strategie optymalizacji**:

  - Buforowanie podobnych zapytań (z uwzględnieniem prywatności)
  - Implementacja asynchronicznego przetwarzania dla długich tekstów
  - Użycie mechanizmu kolejkowego dla zapytań w przypadku wysokiego obciążenia
  - Progresywne ładowanie wyników w interfejsie użytkownika

- **Monitorowanie**:
  - Śledzenie czasów odpowiedzi
  - Monitorowanie kosztów korzystania z usługi AI
  - Alerty dla anomalii w użyciu

## 9. Etapy wdrożenia

### 9.1. Utworzenie struktury plików

1. Utworzenie pliku obsługi endpointu: `src/pages/api/flashcards/generate.ts`
2. Implementacja schematów walidacji Zod
3. Utworzenie lub rozszerzenie serwisu AI: `src/lib/services/generate-service.ts`
4. Dodanie mechanizmu uwierzytelniania poprzez Supabase Auth;
5. Implementacja logiki endpointu, wykorzystującej utworzony serwis
6. Dodanie sczegółowego logowania i błędów
