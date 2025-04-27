# API Endpoint Implementation Plan: GET /api/flashcards

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania fiszek użytkownika z opcjonalnym filtrowaniem, sortowaniem i paginacją. Zwraca listę fiszek należących do zalogowanego użytkownika wraz z metadanymi paginacji.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/flashcards`
- Parametry query:
  - Opcjonalne:
    - `page` (integer): Numer strony, domyślnie 1
    - `limit` (integer): Liczba elementów na stronę, domyślnie 20, maksymalnie 100
    - `sort` (string): Pole sortowania (created_at, updated_at), domyślnie created_at
    - `order` (string): Kolejność sortowania (asc, desc), domyślnie desc
    - `source` (string): Filtrowanie według źródła (manual, ai, semi_ai)

## 3. Wykorzystywane typy
```typescript
// Typy z src/types.ts:
import type { Flashcard, PaginatedResponse, Pagination } from '../types';

// Typ dla parametrów zapytania:
type GetFlashcardsQueryParams = {
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  source?: 'manual' | 'ai' | 'semi_ai';
};
```

## 4. Szczegóły odpowiedzi
- Status 200 OK:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "source": "string",
        "ai_metadata": "object|null",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- Status 401 Unauthorized: Użytkownik nie jest uwierzytelniony
- Status 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Walidacja parametrów zapytania przy użyciu Zod
2. Pobranie uwierzytelnionego użytkownika z kontekstu (Astro.locals)
3. Wywołanie serwisu FlashcardService.getUserFlashcards z parametrami i ID użytkownika
4. Transformacja danych do wymaganego formatu odpowiedzi
5. Zwrócenie odpowiedzi z kodem 200 OK

## 6. Względy bezpieczeństwa
- Walidacja wejść: Ścisła walidacja wszystkich parametrów zapytania przy użyciu Zod
- Zapobieganie SQL Injection: Używanie parametryzowanych zapytań przez klienta Supabase

## 7. Obsługa błędów
- 401 Unauthorized:
  - Brak tokenu uwierzytelniającego
  - Wygasły token
  - Nieprawidłowy token
- 500 Internal Server Error:
  - Błędy bazy danych
  - Nieoczekiwane wyjątki
  - Problemy z usługą Supabase
- Logowanie błędów: Rejestrowanie błędów 500 w tabeli system_logs z odpowiednim error_code, error_message i user_id

## 8. Rozważania dotyczące wydajności
- Paginacja:
  - Ograniczenie maksymalnej liczby elementów na stronę do 100
  - Używanie offsetu i limitu w zapytaniach SQL dla efektywnej paginacji
- Cachowanie:
  - W przyszłych wersjach można dodać cachowanie odpowiedzi API dla często używanych zapytań

## 9. Etapy wdrożenia
1. Utworzenie pliku endpoint handlera `/src/pages/api/flashcards.ts` z obsługą metody GET
2. Implementacja schematu walidacji Zod dla parametrów zapytania
3. Stworzenie lub rozszerzenie FlashcardService z metodą getUserFlashcards
4. Implementacja logiki pobierania danych z Supabase
5. Dodanie logiki paginacji i sortowania
6. Dodanie obsługi filtrowania według source
7. Implementacja obsługi błędów i logowanie
8. Testy jednostkowe dla serwisu