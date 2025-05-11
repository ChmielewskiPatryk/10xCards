# Specyfikacja techniczna modułu autentykacji - 10xCards

## 1. Architektura interfejsu użytkownika

### 1.1 Struktura stron i komponentów

#### Strony Astro

- `src/pages/auth/register.astro` - strona rejestracji
- `src/pages/auth/login.astro` - strona logowania
- `src/pages/auth/forgot-password.astro` - strona odzyskiwania hasła
- `src/pages/auth/reset-password.astro` - strona resetowania hasła (dostępna po kliknięciu w link z emaila)

#### Komponenty React

- `src/components/auth/RegisterForm.tsx` - formularz rejestracji
- `src/components/auth/LoginForm.tsx` - formularz logowania
- `src/components/auth/ForgotPasswordForm.tsx` - formularz odzyskiwania hasła
- `src/components/auth/ResetPasswordForm.tsx` - formularz resetowania hasła
- `src/components/auth/AuthLayout.tsx` - layout dla stron autentykacji
- `src/components/auth/AuthProvider.tsx` - provider kontekstu autentykacji

#### Komponenty do rozszerzenia

- `src/components/layouts/MainLayout.astro` - dodanie stanu autentykacji i przycisku wylogowania
- `src/components/Navigation.tsx` - dodanie warunkowego renderowania elementów nawigacji

### 1.2 Rozdzielenie odpowiedzialności

#### Strony Astro

- Serwerowe renderowanie podstawowej struktury strony
- Inicjalizacja kontekstu autentykacji
- Obsługa przekierowań dla zalogowanych/niezalogowanych użytkowników
- Integracja z Supabase Auth na poziomie serwera

#### Komponenty React

- Obsługa formularzy i walidacji po stronie klienta
- Komunikacja z Supabase Auth SDK
- Zarządzanie stanem formularzy i błędami
- Obsługa nawigacji po udanej autentykacji

### 1.3 Walidacja i komunikaty błędów

#### Walidacja formularzy

- Email: format, wymagane pole
- Hasło: minimalna długość (8 znaków), wymagane pole
- Potwierdzenie hasła: zgodność z hasłem, wymagane pole

#### Komunikaty błędów

- Błędy walidacji formularza (po stronie klienta)
- Błędy autentykacji Supabase (po stronie serwera)
- Komunikaty sukcesu dla operacji (rejestracja, reset hasła)

### 1.4 Scenariusze obsługi

#### Rejestracja

1. Użytkownik wypełnia formularz
2. Walidacja po stronie klienta
3. Wywołanie Supabase Auth.signUp()
4. Przekierowanie do strony logowania z komunikatem sukcesu

#### Logowanie

1. Użytkownik wypełnia formularz
2. Walidacja po stronie klienta
3. Wywołanie Supabase Auth.signIn()
4. Przekierowanie do dashboardu

#### Odzyskiwanie hasła

1. Użytkownik wprowadza email
2. Wywołanie Supabase Auth.resetPasswordForEmail()
3. Przekierowanie do strony logowania z komunikatem
4. Użytkownik otrzymuje email z linkiem resetującym

## 2. Logika backendowa

### 2.1 Walidacja danych

#### Po stronie klienta

- Biblioteka zod do walidacji schematów
- Integracja z react-hook-form dla formularzy

#### Po stronie serwera

- Middleware do weryfikacji sesji
- Walidacja tokenów JWT

### 2.2 Obsługa wyjątków

#### Typy błędów

- AuthApiError - błędy Supabase Auth
- ValidationError - błędy walidacji
- NetworkError - błędy sieciowe

#### Obsługa błędów

- Globalny error boundary dla komponentów React
- Strona błędu dla błędów serwerowych
- Komunikaty toast dla błędów formularzy

## 3. System autentykacji

### 3.1 Integracja z Supabase Auth

#### Konfiguracja

- Inicjalizacja klienta Supabase w kontekście Astro
- Konfiguracja providera autentykacji w komponencie AuthProvider

#### Funkcjonalności

- Rejestracja z email i hasłem
- Logowanie z email i hasłem
- Resetowanie hasła przez email
- Wylogowanie
- Obsługa sesji i tokenów JWT

### 3.2 Bezpieczeństwo

#### Środki bezpieczeństwa

- HTTPS dla wszystkich endpointów
- CORS policy
- Rate limiting dla endpointów autentykacji
- Walidacja tokenów JWT
- Hashowanie haseł przez Supabase

#### Polityka haseł

- Minimalna długość: 8 znaków
- Wymagane znaki specjalne
- Wymagane cyfry
- Wymagane wielkie litery

### 3.3 Dodatkowe informacje

#### Diagram autoryzacji : @auth-diagram.md

#### Diagram przepływu : @juroney-diagram.md

#### Diagram UI: @ui-diagram.md
