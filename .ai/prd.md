# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

10xCards to aplikacja do tworzenia fiszek edukacyjnych z wykorzystaniem sztucznej inteligencji. Umożliwia użytkownikom automatyczne generowanie fiszek na podstawie wprowadzonego tekstu, a także ręczne tworzenie, edytowanie i zarządzanie fiszkami. Produkt wykorzystuje modele LLM typu open-source do analizy i przetwarzania tekstu w celu wyodrębnienia kluczowych informacji, które następnie są przekształcane w fiszki.

Główne funkcje aplikacji:
- Automatyczne generowanie fiszek z tekstu wejściowego
- Ręczne tworzenie i edytowanie fiszek
- Podstawowy system kont użytkownika
- Integracja z istniejącym algorytmem powtórek

## 2. Problem użytkownika

Użytkownicy często stoją przed wyzwaniem efektywnego przetwarzania dużych ilości tekstu w celu nauki lub przyswojenia kluczowych informacji. Tradycyjne metody tworzenia fiszek są czasochłonne i wymagają manualnej identyfikacji najważniejszych punktów w materiale źródłowym.

Problemy, które rozwiązuje 10xCards:
1. Czasochłonność procesu tworzenia fiszek - automatyzacja znacząco skraca czas potrzebny na przygotowanie materiałów do nauki
2. Trudność w organizacji i zarządzaniu dużą liczbą fiszek - aplikacja zapewnia prosty system zarządzania

## 3. Wymagania funkcjonalne

### 3.1 Generowanie fiszek przez AI
- System musi umożliwiać wprowadzenie tekstu źródłowego (minimum 10 tysięcy znaków)
- System musi przeprowadzać walidację tekstu wejściowego pod kątem minimalnej wymaganej długości
- System musi wykorzystywać model LLM typu open-source do analizy tekstu
- System musi automatycznie tworzyć fiszki na podstawie wprowadzonego tekstu

### 3.2 Zarządzanie fiszkami
- System musi umożliwiać przeglądanie wygenerowanych fiszek
- System musi umożliwiać edycję istniejących fiszek
- System musi umożliwiać usuwanie niepotrzebnych fiszek
- System musi umożliwiać ręczne tworzenie nowych fiszek

### 3.3 System kont użytkowników
- System musi umożliwiać rejestrację i logowanie użytkowników
- System musi zabezpieczać dane osobowe i fiszki użytkowników
- System musi przypisywać fiszki do konkretnych użytkowników

### 3.4 Audyt i analityka
- System musi rejestrować w logach sposób utworzenia każdej fiszki (manualnie, całkowicie przez AI lub semi AI)

### 3.5 Interfejs użytkownika
- Interfejs musi być prosty i przejrzysty
- Przyciski i pola muszą być czytelne i posiadać odpowiednie opisy
- Interfejs musi być intuicyjny dla użytkowników o różnym poziomie zaawansowania technicznego

## 4. Granice produktu

### 4.1 Co jest w zakresie MVP
- Interfejs użytkownika do tworzenia fiszek
- Automatyczne generowanie fiszek za pomocą AI
- Podstawowy system zarządzania fiszkami (przeglądanie, edycja, usuwanie)
- Prosty system kont użytkownika
- Integracja z istniejącym algorytmem powtórek
- Podstawowe logi audytowe rejestrujące sposób utworzenia fiszki

### 4.2 Co jest poza zakresem MVP
- Materiały edukacyjne lub tutoriale
- Rozszerzone funkcje zarządzania fiszkami (np. kategoryzacja, tagowanie)
- Zaawansowane funkcje społecznościowe
- Zaawansowane metryki i analityka
- Aplikacja mobilna (jeśli główna wersja jest webowa)
- Integracja z zewnętrznymi platformami edukacyjnymi
- Weryfikacja jakości odpowiedzi AI przez grupy testowe

## 5. Historyjki użytkowników

### US-001: Rejestracja użytkownika
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę się zarejestrować w systemie, aby móc korzystać z funkcji tworzenia i zarządzania fiszkami.
- Kryteria akceptacji:
  1. Użytkownik może utworzyć konto podając adres email i  hasło
  2. System waliduje poprawność adresu email
  3. Użytkownik otrzymuje potwierdzenie utworzenia konta
  4. Użytkownik może zalogować się na nowo utworzone konto

### US-002: Logowanie użytkownika
- Tytuł: Logowanie do systemu
- Opis: Jako zarejestrowany użytkownik, chcę się zalogować do systemu, aby uzyskać dostęp do moich fiszek.
- Kryteria akceptacji:
  1. Użytkownik może wprowadzić swój adres email i hasło
  2. System weryfikuje poprawność danych logowania
  3. Przy poprawnych danych użytkownik zostaje zalogowany i przekierowany do głównego widoku aplikacji
  4. Przy niepoprawnych danych użytkownik otrzymuje stosowny komunikat błędu

### US-003: Generowanie fiszek przez AI
- Tytuł: Automatyczne generowanie fiszek
- Opis: Jako użytkownik, chcę uruchomić proces automatycznego generowania fiszek na podstawie wprowadzonego tekstu, aby zaoszczędzić czas na ręcznym tworzeniu.
- Kryteria akceptacji:
  1. Interfejs zawiera pole tekstowe umożliwiające wprowadzenie co najmniej 1000 do 10000 tysięcy znaków
  2. System informuje o rozpoczęciu i postępie procesu generowania
  3. Po zakończeniu generowania użytkownik otrzymuje liste wygenerowanych fiszek, które nie sa zapisywane w systemie.
  4. Fiszki są kandydatami na fiszkę - dopiero po zaakceprowaniu fiszki przez użytkownika zostaje ona zapisana do bazy danych


### US-004 Przegląd fiszek
Tytuł: Przegląd i zatwierdzanie propozycji fiszek
Opis: Jako zalogowany użytkownik chcę móc przeglądać wygenerowane fiszki i decydować, które z nich chcę dodać do mojego zestawu, aby zachować tylko przydatne pytania i odpowiedzi.
Kryteria akceptacji:
- Lista wygenerowanych fiszek jest wyświetlana pod formularzem generowania.
- Przy każdej fiszce znajduje się przycisk pozwalający na jej zatwierdzenie, edycję lub odrzucenie.
- Po zatwierdzeniu wybranych fiszek użytkownik może kliknąć przycisk zapisu i dodać je do bazy danych.

### US-005: Edytowanie fiszek
- Tytuł: Edycja istniejących fiszek
- Opis: Jako użytkownik, chcę edytować wygenerowane fiszki, aby dostosować je do moich potrzeb.
- Kryteria akceptacji:
  1. Użytkownik może wybrać fiszkę do edycji
  2. System wyświetla formularz edycji z aktualnymi danymi fiszki
  3. Użytkownik może zmienić zawartość przodu i tyłu fiszki
  4. Po zapisaniu zmian system aktualizuje fiszkę w bazie danych
  5. W logach audytowych zapisywana jest informacja o edycji fiszki wygenerowanej przez AI (zmiana statusu na semi AI)

### US-006: Ręczne tworzenie fiszek
- Tytuł: Manualne tworzenie fiszek
- Opis: Jako użytkownik, chcę ręcznie tworzyć nowe fiszki, aby uzupełnić zestaw o własne materiały.
- Kryteria akceptacji:
  1. Interfejs zawiera opcję ręcznego dodania nowej fiszki
  2. System wyświetla formularz tworzenia fiszki z polami na przód i tył
  3. Użytkownik może wprowadzić własną treść fiszki
  4. Po zapisaniu fiszka jest dodawana do zestawu użytkownika
  5. W logach audytowych zapisywana jest informacja o ręcznym utworzeniu fiszki

### US-007: Usuwanie fiszek
- Tytuł: Usuwanie niepotrzebnych fiszek
- Opis: Jako użytkownik, chcę usuwać zbędne fiszki, aby utrzymać porządek w moim zestawie.
- Kryteria akceptacji:
  1. Przy każdej fiszce dostępna jest opcja usunięcia
  2. System prosi o potwierdzenie przed ostatecznym usunięciem
  3. Po potwierdzeniu fiszka jest usuwana z zestawu użytkownika
  4. System informuje o pomyślnym usunięciu fiszki

### US-008: Integracja z algorytmem powtórek
- Tytuł: Korzystanie z algorytmu powtórek
- Opis: Jako użytkownik, chcę korzystać z algorytmu powtórek, aby efektywnie uczyć się z utworzonych fiszek.
- Kryteria akceptacji:
  1. System integruje się z istniejącym algorytmem powtórek
  2. Użytkownik ma dostęp do funkcji powtórek dla swoich fiszek
  3. System śledzi postępy użytkownika w nauce
  4. Algorytm dostosowuje częstotliwość powtórek na podstawie wyników użytkownika
  5. System wyświela przód fiszki - użytkownik poprzez interakcje wyświelta tył
  6. Użytkownik ocenia zgodnie z oczekiwaniami algorytmu przyswojenie fiszki
  7. Algorytm pokazuje następną fiszkę w ramach sesji

### US-009: Wylogowanie z systemu
- Tytuł: Wylogowanie z aplikacji
- Opis: Jako zalogowany użytkownik, chcę się wylogować z systemu, aby zabezpieczyć swoje dane.
- Kryteria akceptacji:
  1. Interfejs zawiera przycisk wylogowania dostępny z każdego widoku
  2. Po kliknięciu przycisku wylogowania sesja użytkownika jest kończona
  3. Użytkownik jest przekierowywany do strony logowania
  4. Dane sesji są czyszczone po wylogowaniu

## US-010: Bezpieczny dostęp i uwierzytelnianie
- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z rejestracji oraz logowania "ad-hoc" bez logowania się do systemu.
  - Użytkownik NIE MOŻE korzystać z pozostałych funkcji bez logowania się do systemu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu
1. Efektywność generowania fiszek:
   - 75% wygenerowanych przez AI fiszek jest akceptowanych przez użytkownika.
   - Użytkownicy tworzą co najmniej 75% fiszek z wykorzystaniem AI (w stosunku do wszystkich nowo dodanych fiszek).
3. Zaangażowanie:
   - Monitorowanie liczby wygenerowanych fiszek i porównanie z liczbą zatwierdzonych do analizy jakości i użyteczności.