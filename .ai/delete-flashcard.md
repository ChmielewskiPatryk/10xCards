# API Endpoint Implementation Plan: DELETE /api/flashcards/:id

## 1. Przegląd punktu końcowego

Endpoint umożliwia usunięcie pojedynczej fiszki (flashcard) na podstawie jej identyfikatora. Wykonanie operacji skutkuje trwałym usunięciem fiszki z bazy danych wraz z powiązanymi danymi (przeglądy, sesje), jeśli istnieją.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE
- Struktura URL: `/api/flashcards/:id`
- Parametry:
  - Wymagane: `id` (UUID fiszki do usunięcia, przekazany w ścieżce URL)
  - Opcjonalne: brak
- Request Body: brak (operacja DELETE nie wymaga ciała żądania)

## 3. Wykorzystywane typy

Endpoint wykorzystuje istniejący typ z `src/types.ts`:

- `Flashcard` - reprezentacja fiszki w systemie

## 4. Szczegóły odpowiedzi

- Sukces: 204 No Content (bez ciała odpowiedzi)
- Błędy:
  - 401 Unauthorized: Użytkownik nie jest zalogowany
  - 404 Not Found: Fiszka o podanym ID nie istnieje
  - 500 Internal Server Error: Wystąpił błąd podczas przetwarzania żądania

## 5. Przepływ danych

1. Endpoint otrzymuje żądanie DELETE z identyfikatorem fiszki
2. Pobranie klienta Supabase z context.locals
3. Walidacja formatu UUID identyfikatora
4. Wywołanie metody serwisowej `flashcardService.deleteFlashcard(id)`
5. Serwis weryfikuje istnienie fiszki oraz czy należy do zalogowanego użytkownika
6. Jeśli weryfikacja przebiegnie pomyślnie, fiszka jest usuwana z bazy danych
7. Powiązane rekordy (flashcard_reviews, session_reviews) są usuwane automatycznie dzięki kaskadowemu usuwaniu (ON DELETE CASCADE)
8. Zwracana jest odpowiedź 204 No Content

## 6. Względy bezpieczeństwa

- **Walidacja danych**: Sprawdzenie poprawności formatu UUID identyfikatora

## 7. Obsługa błędów

- **Niepoprawny format UUID**: 400 Bad Request (identyfikator ma nieprawidłowy format)
- **Fiszka nie istnieje**: 404 Not Found (fiszka o podanym ID nie istnieje)
- **Błąd bazy danych**: 500 Internal Server Error (zapis błędu w tabeli system_logs z odpowiednim kodem błędu)

## 8. Rozważania dotyczące wydajności

- Operacja usunięcia jest prosta i szybka dzięki indeksom na primary key
- Kaskadowe usuwanie powiązanych rekordów jest obsługiwane przez bazę danych, co eliminuje potrzebę dodatkowych zapytań
- Prawdopodobnie nie istnieją istotne wąskie gardła wydajności dla tej operacji

## 9. Etapy wdrożenia

1. Utworzenie pliku endpointu `src/pages/api/flashcards/[id].ts` z obsługą metody DELETE
2. Implementacja walidacji parametru ID za pomocą Zod
3. Utworzenie/aktualizacja serwisu `src/lib/services/flashcardService.ts` z metodą `deleteFlashcard(id: string)`
4. Implementacja weryfikacji istnienia i własności fiszki w serwisie
5. Implementacja obsługi błędów i logowania
6. Implementacja odpowiedzi na żądanie
7. Testy jednostkowe dla serwisu
8. Testy integracyjne dla endpointu
