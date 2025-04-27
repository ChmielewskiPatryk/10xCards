# Plan implementacji widoku Przegląd fiszek

## 1. Przegląd
Widok umożliwia zalogowanemu użytkownikowi przeglądanie, filtrowanie, sortowanie, paginację oraz zarządzanie (edycja, usuwanie) jego fiszkami.

## 2. Routing widoku
Ścieżka: `/flashcards`
Widok chroniony wymaga uwierzytelnienia użytkownika.

## 3. Struktura komponentów
- **FlashcardsPage**
  - FilterSortControls
  - FlashcardsList
    - FlashcardCard (lista kart)
      - Button (Edytuj)
      - Button (Usuń)
  - Pagination
  - LoadingSpinner
  - ConfirmDialog
  - Toast

## 4. Szczegóły komponentów

### FlashcardsPage
- Opis: Kontener całej strony odpowiedzialny za zarządzanie stanem, wywołania API i obsługę interakcji.
- Główne elementy:
  - Nagłówek strony
  - FilterSortControls
  - FlashcardsList
  - Pagination
  - LoadingSpinner (pokazywany podczas ładowania danych)
  - ConfirmDialog (przy usuwaniu)
  - Toast (feedback)
- Obsługiwane zdarzenia:
  - onFilterChange(source)
  - onSortChange(sort, order)
  - onPageChange(page)
  - onEdit(id)
  - onDelete(id)
- Walidacja:
  - `page >= 1`, `limit ∈ [1,100]`
  - `sort ∈ {created_at, updated_at}`
  - `order ∈ {asc, desc}`
- Typy:
  - `FlashcardsPageViewModel`
- Propsy: brak (samodzielny widok)

### FilterSortControls
- Opis: Panel wyboru źródła fiszek, pola sortowania i kolejności.
- Elementy:
  - Select dla `source` (`'all' | 'manual' | 'ai' | 'semi_ai'`)
  - Select dla `sort` (`'created_at' | 'updated_at'`)
  - Select lub toggle dla `order` (`'asc' | 'desc'`)
- Interakcje:
  - `onSourceChange(source)`
  - `onSortChange(sort)`
  - `onOrderChange(order)`
- Walidacja: wartości zgodne z API
- Typy:
  - `FilterSortProps { source, sort, order, handlers }`

### FlashcardsList
- Opis: Wyświetla listę fiszek lub placeholder jeśli pusta.
- Elementy:
  - Lista komponentów `FlashcardCard`
  - `LoadingSpinner` podczas ładowania
  - Tekst „Brak fiszek” gdy `items.length === 0`
- Interakcje:
  - Deleguje `onEdit(id)` i `onDelete(id)` do `FlashcardCard`
- Typy:
  - `FlashcardItem`
  - `FlashcardsListProps { items: FlashcardItem[], handlers }`

### FlashcardCard
- Opis: Karta reprezentująca pojedynczą fiszkę.
- Elementy:
  - `front_content` i `back_content`
  - Metadata: `source`, `created_at`
  - Przycisk `Edytuj`, `Usuń`
- Interakcje:
  - `onEdit(id)`
  - `onDelete(id)`
- Propsy:
  - `FlashcardItem`
  - `handlers { onEdit, onDelete }`

### Pagination
- Opis: Nawigacja między stronami fiszek.
- Elementy:
  - Przycisk „Poprzednia”
  - Przycisk „Następna”
  - Numery stron
- Interakcje:
  - `onPageChange(newPage: number)`
- Typy:
  - `PaginationProps { page: number, pages: number, onPageChange: (n: number) => void }`

### ConfirmDialog
- Opis: Dialog potwierdzenia akcji (usuwanie).
- Propsy:
  - `message: string`
  - `onConfirm: () => void`
  - `onCancel: () => void`

### Toast
- Opis: Powiadomienia o sukcesie lub błędzie.
- Wywołanie:
  - `showToast(message: string, type: 'success' | 'error' | 'info')`
- Typy:
  - `ToastType`

### Button
- Opis: Uniwersalny przycisk UI z wariantami (primary, danger itp.)

### LoadingSpinner
- Opis: Wskaźnik ładowania dla oczekiwania na dane.

## 5. Typy

### FlashcardItem
- `id: string`
- `front_content: string`
- `back_content: string`
- `source: 'manual' | 'ai' | 'semi_ai'`
- `created_at: string`
- `updated_at: string`

### Pagination
- `total: number`
- `page: number`
- `limit: number`
- `pages: number`

### FilterSort
- `source: 'manual' | 'ai' | 'semi_ai' | 'all'`
- `sort: 'created_at' | 'updated_at'`
- `order: 'asc' | 'desc'`

### FlashcardsPageViewModel
- `items: FlashcardItem[]`
- `pagination: Pagination`
- `filters: FilterSort`

## 6. Zarządzanie stanem
Stan utrzymywany w `FlashcardsPage` lub w custom hooku `useFlashcards`:
- `loading: boolean`
- `error: string | null`
- `data: FlashcardItem[]`
- `pagination: Pagination`
- `filters: FilterSort`

**Custom hook** `useFlashcards(filters, page)` zwraca:
```ts
{ data, pagination, loading, error, refresh }
```

## 7. Integracja API
- Endpoint: `GET /api/flashcards?page=&limit=20&sort=&order=&source=`
- Request: brak body
- Response:
  ```ts
  interface FlashcardsResponse {
    data: FlashcardItem[];
    pagination: Pagination;
  }
  ```
- Obsługa błędów HTTP 401 (redirect), 500 (toast)

## 8. Interakcje użytkownika
- Zmiana filtra → fetch z nowymi parametrami
- Zmiana sortowania → fetch
- Klik paginacji → fetch
- Klik „Edytuj” → redirect do `/flashcards/edit/:id` lub modal
- Klik „Usuń” → otwarcie `ConfirmDialog`, po potwierdzeniu wywołanie `DELETE` i `refresh`
- Wyświetlenie toast po sukcesie/błędzie

## 9. Warunki i walidacja
- UI zapewnia, że `page ≥ 1`, `limit ≤ 100`
- Selekty dla `source`, `sort`, `order` zawierają tylko poprawne wartości
- Blokada przycisków paginacji (gdy `page === 1` lub `page === pages`)

## 10. Obsługa błędów
- Błąd sieci/timeout → toast z komunikatem, retry button
- Błąd 401 → przekierowanie do strony logowania
- Błąd 500 → toast z komunikatem serwera
- Brak fiszek → wyświetlenie komunikatu „Brak fiszek” zamiast listy

## 11. Kroki implementacji
1. Utworzenie pliku `/src/pages/flashcards.astro` lub `.tsx` w Astro
2. Implementacja `FlashcardsPage` z importem i układem komponentów
3. Stworzenie i przetestowanie komponentu `FilterSortControls`
4. Napisanie custom hooka `useFlashcards`
5. Implementacja `FlashcardsList` i `FlashcardCard` z handlerami
6. Dodanie `Pagination` i obsługa `onPageChange`
7. Dodanie `LoadingSpinner`, `ConfirmDialog` i `Toast`
8. Podłączenie handlerów edycji i usuwania (future API)
9. Testy funkcjonalne (filtry, sortowanie, paginacja, usuwanie)
10. Weryfikacja zgodności z PRD, User Stories oraz standardami projektu
