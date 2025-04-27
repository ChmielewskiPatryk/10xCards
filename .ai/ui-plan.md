# Architektura UI dla 10xCards

## 1. Przegląd struktury UI
Aplikacja oparta na Astro z klient‑side hydratowanymi komponentami React. Globalny layout (`MainLayout.astro`) zapewnia persistentny sidebar z linkami do głównych widoków oraz header z przełącznikiem motywu i przyciskiem wylogowania. Autoryzacja oparta na HttpOnly cookies; trasy poza `/login` i `/register` chronione. Wszystkie wywołania API realizowane przez `fetch` z `credentials: 'include'`, `AbortController` i timeoutami (30 s dla CRUD, 2 min dla generowania). Globalny stan (auth, theme, notifications) zarządzany w React Context. Komponenty Shadcn/ui dla formularzy, checkboxów, modalów i toastów. Dialogi potwierdzające dla operacji destrukcyjnych. Desktop‑first design z podstawową responsywnością i trybem dark/light.

## 2. Lista widoków

### Rejestracja
- Ścieżka: `/register`
- Główny cel: Utworzenie konta użytkownika poprzez podanie adresu email i hasła.
- Kluczowe informacje: Pola formularza (email, password), walidacja adresu email, komunikat sukcesu/błędu.
- Komponenty: `AuthForm` (shadcn/ui), hook `useAuth`, `LoadingSpinner`, `Toast`.
- UX/dostępność/bezpieczeństwo: Walidacja inline, aria-labels, pole `password` zabezpieczone, komunikaty zrozumiałe.

### Logowanie
- Ścieżka: `/login`
- Główny cel: Autoryzacja użytkownika za pomocą email i hasła.
- Kluczowe informacje: Formularz logowania, komunikaty błędów, link do rejestracji.
- Komponenty: `AuthForm`, `useAuth`, `LoadingSpinner`, `Toast`.
- UX/dostępność/bezpieczeństwo: Obsługa błędnych danych, aria-describedby komunikatów.

### Dashboard
- Ścieżka: `/`
- Główny cel: Punkt wyjścia dla użytkownika, szybki dostęp do głównych funkcji.
- Kluczowe informacje: Kafle/linki: Generowanie fiszek, Moje fiszki, Sesje powtórek, Ustawienia.
- Komponenty: `DashboardOverview`.
- UX/dostępność/bezpieczeństwo: Wyraźne call-to-action, czytelne etykiety.

### Generowanie fiszek
- Ścieżka: `/flashcards/generate`
- Główny cel: Automatyczne generowanie propozycji fiszek na podstawie tekstu.
- Kluczowe informacje: Pole `textarea` na tekst źródłowy, przycisk `Generuj`, pasek postępu/spinner, lista propozycji z checkboxami, przycisk `Akceptuj`.
- Komponenty: `GenerateSession`, `Checkbox`, `Button`, `LoadingSpinner`, `Toast`, `ConfirmDialog`.
- UX/dostępność/bezpieczeństwo: Timeout 2 min, możliwość anulowania, czytelne etykiety formularza.

### Ręczne tworzenie fiszek
- Ścieżka: `/flashcards/new`
- Główny cel: Dodanie nowej fiszki ręcznie.
- Kluczowe informacje: Formularz (front content, back content), walidacja Zod.
- Komponenty: `ManualFlashcardForm` (react-hook-form + Zod), `Button`, `Toast`, `ConfirmDialog`.
- UX/dostępność/bezpieczeństwo: Inline validation, aria-labels, potwierdzenie przed zapisem.

### Przegląd fiszek
- Ścieżka: `/flashcards`
- Główny cel: Przegląd, filtrowanie, sortowanie, paginacja i zarządzanie fiszkami.
- Kluczowe informacje: Tabela/kafelki z front/back, source, data utworzenia, akcje edycji i usunięcia, kontrolki paginacji, sortowania i filtrowania.
- Komponenty: `FlashcardsList`, `Pagination`, `FilterSortControls`, `Button`, `LoadingSpinner`, `ConfirmDialog`, `Toast`.
- UX/dostępność/bezpieczeństwo: 20 elementów na stronę, chronione trasy, potwierdzenie usunięcia.

### Edycja fiszki
- Ścieżka: `/flashcards/[id]/edit`
- Główny cel: Modyfikacja zawartości istniejącej fiszki.
- Kluczowe informacje: Formularz z prefill, walidacja, komunikat sukcesu.
- Komponenty: `FlashcardEdit`, `Button`, `LoadingSpinner`, `Toast`, `ConfirmDialog`.
- UX/dostępność/bezpieczeństwo: Obsługa błędnych ID (404), walidacja.

### Sesje powtórek
- Ścieżka: `/study-sessions`
- Główny cel: Przegląd historii sesji i inicjowanie nowych.
- Kluczowe informacje: Lista sesji (id, start, end, cards_reviewed), przycisk `Rozpocznij nową`.
- Komponenty: `SessionList`, `SessionCard`, `Button`, `ConfirmDialog`, `Toast`, `LoadingSpinner`.
- UX/dostępność/bezpieczeństwo: Potwierdzenie przed rozpoczęciem, obsługa braku danych.

#### Przegląd sesji
- Ścieżka: `/study-sessions/[id]`
- Główny cel: Obsługa sesji powtórek - wyświetlanie fiszki, ocena, przejście do następnej.
- Kluczowe informacje: Front fiszki, przycisk `Pokaż odpowiedź`, opcje oceny (0-5), postęp, informacja `is_last`.
- Komponenty: `SessionReview`, `Button`, `Toast`, `LoadingSpinner`.
- UX/dostępność/bezpieczeństwo: Obsługa końca sesji, blokowanie nawigacji podczas sesji.

### Ustawienia konta
- Ścieżka: `/settings`
- Główny cel: Zarządzanie ustawieniami użytkownika (motyw, wylogowanie).
- Kluczowe informacje: Toggle motywu, przycisk `Wyloguj`.
- Komponenty: `SettingsForm`, `ThemeToggle`, `Button`, `ConfirmDialog`, `Toast`.
- UX/dostępność/bezpieczeństwo: Potwierdzenie wylogowania, czyszczenie ciasteczek.

## 3. Mapa podróży użytkownika
1. Użytkownik niezalogowany: `/login` lub `/register`.
2. Po zalogowaniu: przekierowanie do `/` (Dashboard).
3. Z Dashboard: wybór Generowania fiszek → `/flashcards/generate` → wprowadzenie tekstu → Generuj → wybór propozycji → Akceptuj → sukces → przekierowanie do `/flashcards`.
4. Z Dashboard: przejście do "Moje fiszki" → zarządzanie (edit, delete).
5. Z Dashboard: "Ręczne tworzenie" → `/flashcards/new` → wypełnienie formularza → zapis → powrót do listy.
6. Z Dashboard: "Sesje powtórek" → `/study-sessions` → `Rozpocznij nową` → confirm → `/study-sessions/[id]` → ocena kolejnych fiszek → zakończenie → powrót do listy sesji lub Dashboard.
7. Ustawienia: `/settings` → zmiana motywu lub wylogowanie.

## 4. Układ i struktura nawigacji
- Globalny `MainLayout.astro` z dwoma sekcjami:
  - Sidebar: linki (Dashboard, Generowanie, Moje fiszki, Sesje, Ustawienia).
  - Główna treść: dynamiczne strony Astro.
  - Header: `ThemeToggle`, `LogoutButton`, opcjonalnie breadcrumb.
- Client‑side routing za pomocą `<Link>` z Astro + React.
- Ochrona tras: redirect do `/login` jeśli brak HttpOnly cookie.
- Persistentne elementy: sidebar i header widoczne we wszystkich chronionych widokach.

## 5. Kluczowe komponenty
- `GenerateSession` – obsługa generowania fiszek, lista checkboxów, zatwierdzanie.
- `ManualFlashcardForm` – formularz react-hook-form + Zod do tworzenia fiszki.
- `FlashcardsList` – tabela/kafelki fiszek z akcjami, paginacją, sortowaniem.
- `FlashcardEdit` – formularz edycji fiszki z prefill.
- `SessionList` / `SessionCard` – lista i podsumowanie sesji.
- `SessionReview` – przebieg sesji powtórek (pokaż odpowiedź, ocena, next).
- `AuthForm` – wspólny formularz rejestracji/logowania.
- `ConfirmDialog` – modal potwierdzeń dla operacji destrukcyjnych.
- `Toast` / `ToastContainer` – powiadomienia success/error/info.
- `ThemeToggle` – przełącznik motywu.
- `Sidebar` / `Header` – struktura nawigacji i globalne akcje.
- `LoadingSpinner` – informacja o trwających operacjach. 