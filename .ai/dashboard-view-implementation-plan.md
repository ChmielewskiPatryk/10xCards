# Plan implementacji widoku Dashboard

## 1. Przegląd

Dashboard to główny widok aplikacji 10xCards, który służy jako punkt wyjścia dla zalogowanego użytkownika. Zapewnia szybki dostęp do najważniejszych funkcji aplikacji poprzez intuicyjny interfejs z kafelkami nawigacyjnymi. Głównym celem widoku jest umożliwienie użytkownikowi łatwego przejścia do generowania fiszek, przeglądania istniejących fiszek, rozpoczynania sesji powtórek oraz dostępu do ustawień konta.

## 2. Routing widoku

Widok Dashboard powinien być dostępny pod ścieżką `/` jako strona główna dla zalogowanych użytkowników.

## 3. Struktura komponentów

```
DashboardPage (Astro)
├── DashboardLayout (Astro)
│   ├── DashboardHeader (React)
│   │   └── UserInfo (React)
│   ├── DashboardOverview (React)
│   │   ├── DashboardTile - Generowanie fiszek (React)
│   │   ├── DashboardTile - Moje fiszki (React)
│   │   ├── DashboardTile - Sesje powtórek (React)
│   │   └── DashboardTile - Ustawienia (React)
│   └── DashboardFooter (React)
```

## 4. Szczegóły komponentów

### DashboardPage (Astro)

- Opis komponentu: Główny komponent strony Dashboard, który zawiera layout i obsługuje logikę autoryzacji
- Główne elementy: DashboardLayout
- Obsługiwane interakcje: Przekierowanie na stronę logowania dla niezalogowanych użytkowników
- Obsługiwana walidacja: Sprawdzenie czy użytkownik jest zalogowany
- Typy: Brak specyficznych typów
- Propsy: Brak

### DashboardLayout (Astro)

- Opis komponentu: Definiuje strukturę strony Dashboard
- Główne elementy: DashboardHeader, DashboardOverview, DashboardFooter
- Obsługiwane interakcje: Brak
- Obsługiwana walidacja: Brak
- Typy: User
- Propsy: user: User

### DashboardHeader (React)

- Opis komponentu: Nagłówek widoku Dashboard zawierający logo, tytuł aplikacji oraz informacje o użytkowniku
- Główne elementy: Logo aplikacji, tytuł, komponent UserInfo
- Obsługiwane interakcje: Brak
- Obsługiwana walidacja: Brak
- Typy: User
- Propsy: user: User, onLogout: () => void

### UserInfo (React)

- Opis komponentu: Wyświetla informacje o zalogowanym użytkowniku oraz przycisk wylogowania
- Główne elementy: Avatar użytkownika (opcjonalnie), email użytkownika, przycisk wylogowania
- Obsługiwane interakcje: Kliknięcie przycisku wylogowania
- Obsługiwana walidacja: Brak
- Typy: User, UserInfoProps
- Propsy: user: User, onLogout: () => void

### DashboardOverview (React)

- Opis komponentu: Główny komponent widoku Dashboard zawierający kafelki do nawigacji
- Główne elementy: Zestaw komponentów DashboardTile dla każdej z głównych funkcji
- Obsługiwane interakcje: Brak (interakcje są obsługiwane przez poszczególne kafelki)
- Obsługiwana walidacja: Brak
- Typy: DashboardOverviewProps
- Propsy: tiles: DashboardTileProps[]

### DashboardTile (React)

- Opis komponentu: Kafelek reprezentujący pojedynczą funkcję aplikacji, służący jako link do tej funkcji
- Główne elementy: Ikona, tytuł, krótki opis, opcjonalny licznik
- Obsługiwane interakcje: Kliknięcie przekierowujące do odpowiedniej funkcji
- Obsługiwana walidacja: Brak
- Typy: DashboardTileProps
- Propsy: title: string, description: string, icon: ReactNode | string, linkTo: string, count?: number, color?: string

### DashboardFooter (React)

- Opis komponentu: Stopka widoku Dashboard zawierająca informacje o prawach autorskich i linki pomocnicze
- Główne elementy: Informacje o prawach autorskich, linki do polityki prywatności, regulaminu itp.
- Obsługiwane interakcje: Kliknięcie na linki pomocnicze
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych typów
- Propsy: Brak

## 5. Typy

```typescript
// Podstawowy typ użytkownika
interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
}

// Propsy dla komponentu DashboardTile
interface DashboardTileProps {
  title: string; // Tytuł kafelka
  description: string; // Krótki opis funkcjonalności
  icon: ReactNode | string; // Ikona lub nazwa ikony
  linkTo: string; // Ścieżka, do której ma przekierować
  count?: number; // Opcjonalny licznik (np. liczba fiszek)
  color?: string; // Opcjonalny kolor kafelka
}

// Propsy dla komponentu DashboardOverview
interface DashboardOverviewProps {
  tiles: DashboardTileProps[]; // Lista kafelków do wyświetlenia
}

// Propsy dla komponentu UserInfo
interface UserInfoProps {
  user: User; // Dane użytkownika
  onLogout: () => void; // Funkcja obsługująca wylogowanie
}
```

## 6. Zarządzanie stanem

Zarządzanie stanem w widoku Dashboard jest stosunkowo proste, ponieważ jest to głównie widok nawigacyjny. Główne aspekty zarządzania stanem:

1. **Stan autentykacji** - zarządzany przez hook `useAuth` dostarczany przez Supabase:

```typescript
const { user, signOut } = useAuth();
```

2. **Stan statystyk użytkownika** - do wyświetlania liczników na kafelkach:

```typescript
const useUserStats = () => {
  const [stats, setStats] = useState({
    flashcardsCount: 0,
    sessionsCount: 0,
  });

  useEffect(() => {
    // Pobieranie statystyk z API Supabase
    const fetchStats = async () => {
      // Implementacja pobierania danych
    };

    fetchStats();
  }, []);

  return stats;
};
```

3. **Obsługa wylogowania** - implementowana jako funkcja przekazywana do komponentów:

```typescript
const handleLogout = async () => {
  await signOut();
  // Przekierowanie na stronę logowania
  window.location.href = "/login";
};
```

## 7. Integracja API

Widok Dashboard korzysta z następujących endpointów API Supabase:

1. **Pobranie danych użytkownika**:

```typescript
// Dane użytkownika są dostępne bezpośrednio przez hook useAuth
const { user } = useAuth();
```

2. **Pobranie statystyk użytkownika**:

```typescript
// Przykład pobierania liczby fiszek
const fetchFlashcardsCount = async (userId: string) => {
  const { count, error } = await supabase.from("flashcards").select("id", { count: "exact" }).eq("user_id", userId);

  if (error) {
    console.error("Błąd podczas pobierania liczby fiszek:", error);
    return 0;
  }

  return count || 0;
};

// Przykład pobierania liczby sesji powtórek
const fetchSessionsCount = async (userId: string) => {
  const { count, error } = await supabase
    .from("review_sessions")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  if (error) {
    console.error("Błąd podczas pobierania liczby sesji:", error);
    return 0;
  }

  return count || 0;
};
```

3. **Wylogowanie użytkownika**:

```typescript
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Błąd podczas wylogowywania:", error);
    return;
  }

  // Przekierowanie na stronę logowania
  window.location.href = "/login";
};
```

## 8. Interakcje użytkownika

### Nawigacja do głównych funkcji

- **Kliknięcie na kafelek "Generowanie fiszek"**:
  - Przekierowanie do `/generate`
  - Komponent: `DashboardTile`
- **Kliknięcie na kafelek "Moje fiszki"**:
  - Przekierowanie do `/flashcards`
  - Komponent: `DashboardTile`
- **Kliknięcie na kafelek "Sesje powtórek"**:
  - Przekierowanie do `/review`
  - Komponent: `DashboardTile`
- **Kliknięcie na kafelek "Ustawienia"**:
  - Przekierowanie do `/settings`
  - Komponent: `DashboardTile`

### Wylogowanie

- **Kliknięcie na przycisk wylogowania**:
  - Wywołanie funkcji `onLogout`
  - Wylogowanie użytkownika i przekierowanie na stronę logowania
  - Komponent: `UserInfo`

## 9. Warunki i walidacja

### Dostęp do widoku Dashboard

- Widok Dashboard jest dostępny tylko dla zalogowanych użytkowników
- Tymczasowe mockoowanię autentykacji:

```typescript
// W komponencie DashboardPage.astro - tymczasowy mock autentykacji
// TODO: Zaimplementować prawdziwą autentykację później
// import { supabase } from '../db/supabase';
// const { data: { session } } = await supabase.auth.getSession();

// Tymczasowy mock zalogowanego użytkownika
const mockUser = {
  id: "mock-user-id",
  email: "user@example.com",
  name: "Przykładowy Użytkownik",
  createdAt: new Date(),
};

// Tymczasowo zawsze uznajemy użytkownika za zalogowanego
const isLoggedIn = true;

if (!isLoggedIn) {
  return Astro.redirect("/login");
}

// Przekazanie zamockowanego użytkownika do komponentów
const user = mockUser;
```

## 10. Obsługa błędów

### Błąd autentykacji

- Tymczasowo wyłączone rzeczywiste sprawdzanie autentykacji
- Implementacja mocka:

```typescript
// W komponencie DashboardPage.astro - tymczasowy mock obsługi błędów autentykacji
// TODO: Zaimplementować prawdziwą obsługę błędów autentykacji później
try {
  // Tymczasowo pomijamy rzeczywiste sprawdzanie sesji
  // const { data: { session } } = await supabase.auth.getSession();

  // Tymczasowy mock zalogowanego użytkownika
  const mockUser = {
    id: "mock-user-id",
    email: "user@example.com",
    name: "Przykładowy Użytkownik",
    createdAt: new Date(),
  };

  // Tymczasowo zawsze uznajemy użytkownika za zalogowanego
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return Astro.redirect("/login");
  }
} catch (error) {
  console.error("Błąd podczas sprawdzania sesji (mock):", error);
  // Tymczasowo nie przekierowujemy do logowania w przypadku błędu
  // return Astro.redirect('/login?error=session_error');
}
```

### Błąd pobierania statystyk

- Jeśli nie można pobrać statystyk użytkownika, wyświetlamy domyślne wartości (0)
- Implementacja:

```typescript
const useUserStats = () => {
  const [stats, setStats] = useState({
    flashcardsCount: 0,
    sessionsCount: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Pobieranie statystyk
        // ...
      } catch (err) {
        console.error("Błąd podczas pobierania statystyk:", err);
        setError(err as Error);
        // Ustawienie domyślnych wartości
        setStats({
          flashcardsCount: 0,
          sessionsCount: 0,
        });
      }
    };

    fetchStats();
  }, []);

  return { stats, error };
};
```

## 11. Kroki implementacji

1. **Utworzenie struktury plików**:

   - Utworzenie pliku `src/pages/index.astro`
   - Utworzenie katalogu `src/components/dashboard`
   - Utworzenie plików komponentów:
     - `src/components/dashboard/DashboardLayout.astro`
     - `src/components/dashboard/DashboardHeader.tsx`
     - `src/components/dashboard/UserInfo.tsx`
     - `src/components/dashboard/DashboardOverview.tsx`
     - `src/components/dashboard/DashboardTile.tsx`
     - `src/components/dashboard/DashboardFooter.tsx`

2. **Implementacja komponentu strony**:

   - Implementacja `src/pages/index.astro` z logiką autoryzacji
   - Implementacja przekierowania dla niezalogowanych użytkowników

3. **Implementacja layoutu**:

   - Implementacja `DashboardLayout.astro` definiującego strukturę strony
   - Osadzenie komponentów React w strukturze Astro

4. **Implementacja komponentów React**:

   - Implementacja `DashboardHeader.tsx` z logo i informacjami o użytkowniku
   - Implementacja `UserInfo.tsx` z danymi użytkownika i przyciskiem wylogowania
   - Implementacja `DashboardOverview.tsx` z kafelkami funkcji
   - Implementacja `DashboardTile.tsx` dla każdej funkcji
   - Implementacja `DashboardFooter.tsx` z informacjami prawnymi

5. **Implementacja typów i interfejsów**:

   - Utworzenie pliku `src/types.ts` z definicjami typów
   - Implementacja interfejsów dla komponentów

6. **Implementacja integracji z API**:

   - Utworzenie funkcji do pobierania danych użytkownika
   - Utworzenie funkcji do pobierania statystyk
   - Implementacja funkcji wylogowania

7. **Implementacja zarządzania stanem**:

   - Implementacja hooka `useUserStats` do pobierania statystyk
   - Konfiguracja obsługi autentykacji

8. **Implementacja stylów**:

   - Wykorzystanie Tailwind i Shadcn/ui do stylizacji komponentów
   - Zastosowanie odpowiednich klas dla responsywności

9. **Testowanie**:

   - Testowanie widoku dla zalogowanych i niezalogowanych użytkowników
   - Testowanie nawigacji i interakcji użytkownika
   - Testowanie obsługi błędów i przypadków brzegowych

10. **Finalizacja**:
    - Przeprowadzenie code review
    - Optymalizacja wydajności
    - Ostateczne dostosowanie stylów i UX
