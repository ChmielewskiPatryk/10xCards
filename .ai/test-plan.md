# Plan Testów dla Projektu 10xCards

## 1. Wprowadzenie i cele testowania

Plan testów ma na celu zapewnienie wysokiej jakości aplikacji 10xCards poprzez systematyczne testowanie wszystkich komponentów i funkcjonalności. Główne cele to:

- Weryfikacja zgodności z wymaganiami funkcjonalnymi i niefunkcjonalnymi
- Identyfikacja i eliminacja defektów przed wdrożeniem produkcyjnym
- Zapewnienie stabilności i wydajności aplikacji
- Testowanie integracji z usługami zewnętrznymi (Supabase, OpenRouter.ai)
- Walidacja bezpieczeństwa danych użytkowników
- Zapewnienie optymalizacji wydajności aplikacji

## 2. Zakres testów

Plan obejmuje testowanie:

- Interfejsu użytkownika (komponenty React, strony Astro)
- Logiki biznesowej (zarządzanie fiszkami, sesje nauki)
- API (endpointy Astro API)
- Integracji z Supabase (autentykacja, baza danych)
- Integracji z usługami AI (OpenRouter.ai)
- Responsywności na różnych urządzeniach
- Wydajności i skalowalności
- Bezpieczeństwa i ochrony danych

## 3. Typy testów

### 3.1 Testy jednostkowe
- **Narzędzia**: Vitest, React Testing Library
- **Zakres**: Komponenty UI, hooki, funkcje pomocnicze, serwisy
- **Cele**: Weryfikacja poprawności działania poszczególnych jednostek kodu
- **Priorytety**:
  - Komponenty formularzy (ManualFlashcardForm)
  - Funkcje pomocnicze obsługujące logikę biznesową
  - Hooki niestandardowe

### 3.2 Testy integracyjne
- **Narzędzia**: Vitest, msw (do mockowania API)
- **Zakres**: Interakcje między komponentami, integracja frontend-backend
- **Cele**: Sprawdzenie poprawnej komunikacji między komponentami i serwisami
- **Priorytety**:
  - Integracja z API fiszek
  - Przepływ generowania fiszek przez AI
  - Zarządzanie sesją nauki

### 3.3 Testy API
- **Narzędzia**: Vitest, Supertest
- **Zakres**: Wszystkie endpointy API (/api/flashcards/*, /api/auth/*)
- **Cele**: Weryfikacja poprawności, bezpieczeństwa i wydajności API
- **Priorytety**:
  - CRUD dla fiszek
  - Generowanie fiszek przez AI
  - Zarządzanie sesją nauki
  - Endpointy autentykacji

### 3.4 Testy E2E
- **Narzędzia**: Playwright
- **Zakres**: Przepływy użytkownika end-to-end
- **Cele**: Testowanie pełnych scenariuszy użytkowania
- **Priorytety**:
  - Rejestracja i logowanie
  - Tworzenie i zarządzanie fiszkami
  - Przepływ generowania fiszek przez AI
  - Sesje nauki

### 3.5 Testy wydajnościowe
- **Narzędzia**: Lighthouse, WebPageTest
- **Zakres**: Czas ładowania stron, wydajność renderowania
- **Cele**: Optymalizacja wydajności i doświadczenia użytkownika
- **Priorytety**:
  - Czas do interaktywności (TTI)
  - First Contentful Paint (FCP)
  - Optymalizacja rozmiarów paczek JS

### 3.6 Testy bezpieczeństwa
- **Narzędzia**: OWASP ZAP, ręczne testowanie
- **Zakres**: Autentykacja, autoryzacja, zabezpieczenie API
- **Cele**: Identyfikacja podatności i zapewnienie ochrony danych
- **Priorytety**:
  - Bezpieczeństwo autentykacji
  - Autoryzacja dostępu do danych
  - Zabezpieczenie API przed atakami

### 3.7 Testy dostępności
- **Narzędzia**: Axe, Lighthouse
- **Zakres**: Wszystkie strony i komponenty UI
- **Cele**: Zapewnienie zgodności z WCAG 2.1 AA
- **Priorytety**:
  - Kontrast kolorów
  - Obsługa klawiatury
  - Kompatybilność z czytnikami ekranowymi

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autentykacja użytkowników
1. Rejestracja nowego użytkownika
2. Logowanie istniejącego użytkownika
3. Odzyskiwanie hasła
4. Wylogowanie użytkownika
5. Weryfikacja zabezpieczeń sesji

### 4.2 Zarządzanie fiszkami
1. Tworzenie nowej fiszki manualnie
2. Edycja istniejącej fiszki
3. Usuwanie fiszki
4. Pobieranie listy fiszek z paginacją
5. Filtrowanie i sortowanie fiszek

### 4.3 Generowanie fiszek przez AI
1. Wysyłanie tekstu źródłowego do AI
2. Otrzymywanie propozycji fiszek
3. Edycja propozycji przed zapisaniem
4. Zatwierdzanie wybranych fiszek
5. Obsługa błędów API AI

### 4.4 Sesje nauki
1. Rozpoczynanie nowej sesji
2. Przechodzenie przez fiszki w sesji
3. Ocenianie znajomości materiału
4. Zakończenie sesji i zapisanie wyników
5. Przeglądanie historii sesji

### 4.5 Panel użytkownika
1. Przeglądanie statystyk nauki
2. Zmiana ustawień konta
3. Eksport i import fiszek
4. Zarządzanie subskrypcją (jeśli dotyczy)

## 5. Środowisko testowe

### 5.1 Środowiska
1. **Lokalne** - na maszynach deweloperskich
2. **Deweloperskie** - środowisko CI/CD
3. **Testowe** - dedykowane środowisko z izolowaną bazą danych
4. **Staging** - środowisko przedprodukcyjne
5. **Produkcyjne** - do testów smoke i monitoringu

### 5.2 Konfiguracja
- Supabase w wersji lokalnej dla testów integracyjnych
- Mocki dla API AI w testach jednostkowych i integracyjnych
- Izolowane bazy danych dla każdego środowiska
- Konfiguracja CI/CD w GitHub Actions

## 6. Narzędzia do testowania

1. **Vitest** - framework testowy dla testów jednostkowych i integracyjnych
2. **React Testing Library** - testowanie komponentów React
3. **msw (mock service worker)** - mockowanie zapytań API
4. **Playwright** - testy E2E, zrzuty ekranu i nagrywanie wideo
5. **Axe** - testowanie dostępności
6. **Lighthouse** - testowanie wydajności i dostępności
7. **OWASP ZAP** - testowanie bezpieczeństwa
8. **GitHub Actions** - automatyzacja testów w CI/CD

## 7. Harmonogram testów

1. **Testy jednostkowe i integracyjne** - uruchamiane przy każdym PR
2. **Testy API** - uruchamiane przy każdym PR dotyczącym backendu
3. **Testy E2E** - uruchamiane przed mergem do głównej gałęzi
4. **Testy wydajnościowe** - uruchamiane raz dziennie na środowisku staging
5. **Testy bezpieczeństwa** - uruchamiane raz w tygodniu i przy znaczących zmianach
6. **Testy dostępności** - uruchamiane przy zmianach w UI i raz w tygodniu

## 8. Kryteria akceptacji testów

1. **Testy jednostkowe i integracyjne** - pokrycie kodu min. 80%
2. **Testy API** - 100% pokrycie endpointów
3. **Testy E2E** - wszystkie kluczowe przepływy działają poprawnie
4. **Testy wydajnościowe**:
   - FCP < 1.8s
   - TTI < 3.5s
   - Lighthouse Performance Score > 90
5. **Testy bezpieczeństwa** - brak krytycznych i wysokich podatności
6. **Testy dostępności** - zgodność z WCAG 2.1 AA

## 9. Role i odpowiedzialności

1. **Deweloperzy**:
   - Tworzenie i utrzymanie testów jednostkowych
   - Współpraca przy naprawianiu błędów

2. **QA**:
   - Projektowanie i wykonywanie testów manualnych
   - Tworzenie i utrzymanie testów E2E
   - Raportowanie błędów i monitorowanie ich naprawy

3. **DevOps**:
   - Konfiguracja i utrzymanie środowisk testowych
   - Automatyzacja testów w pipeline CI/CD

4. **Product Owner**:
   - Definiowanie kryteriów akceptacji
   - Priorytetyzacja napraw błędów

## 10. Procedury raportowania błędów

1. **Klasyfikacja błędów**:
   - **Krytyczne** - uniemożliwiają korzystanie z kluczowych funkcji
   - **Wysokie** - znacząco utrudniają korzystanie z aplikacji
   - **Średnie** - powodują problemy, ale istnieje obejście
   - **Niskie** - drobne błędy, głównie kosmetyczne

2. **Proces raportowania**:
   - Wszystkie błędy raportowane w systemie GitHub Issues
   - Wymagane informacje: środowisko, kroki reprodukcji, oczekiwane vs. aktualne zachowanie
   - Załączanie zrzutów ekranu/nagrań wideo dla wizualnych problemów

3. **Proces naprawy**:
   - Błędy krytyczne i wysokie naprawiane natychmiast
   - Błędy średnie planowane do najbliższego sprintu
   - Błędy niskie oceniane i planowane zgodnie z priorytetami

4. **Weryfikacja napraw**:
   - Testy regresji po każdej naprawie
   - Automatyczne testy dla naprawionych błędów

## 11. Zarządzanie ryzykiem

1. **Zidentyfikowane ryzyka**:
   - Problemy z wydajnością przy dużej liczbie fiszek
   - Ograniczenia API AI (limity, koszty, dostępność)
   - Błędy integracji z Supabase
   - Problemy z kompatybilnością przeglądarek

2. **Strategie mitygacji**:
   - Testy wydajnościowe z dużymi zbiorami danych
   - Mechanizmy fallbackowe dla API AI
   - Kompleksowe testy integracji z Supabase
   - Testy kompatybilności na różnych przeglądarkach i urządzeniach

## 12. Metryki i raportowanie

1. **Kluczowe metryki**:
   - Liczba i kategorie znalezionych defektów
   - Pokrycie kodu testami
   - Czas naprawy defektów
   - Wyniki testów wydajnościowych

2. **Raportowanie**:
   - Raporty z testów generowane automatycznie przez CI/CD
   - Cotygodniowe podsumowanie statusu testów
   - Dashboard z kluczowymi metrykami

## 13. Podsumowanie

Plan testów dla projektu 10xCards obejmuje kompleksowe podejście do zapewnienia jakości, od testów jednostkowych po testy E2E i specjalistyczne testy wydajności czy bezpieczeństwa. Nacisk położony jest na automatyzację i integrację testów z procesem CI/CD, co pozwoli na szybkie wykrywanie i naprawianie błędów. Kluczowe funkcjonalności, takie jak zarządzanie fiszkami, generowanie przez AI oraz sesje nauki, są szczególnie dokładnie testowane.

Implementacja tego planu zapewni wysoką jakość aplikacji oraz pozytywne doświadczenia użytkowników 10xCards.