# Plan implementacji widoku generowania fiszek

## 1. Przegląd
Widok generowania fiszek umożliwia użytkownikom automatyczne tworzenie propozycji fiszek edukacyjnych na podstawie wprowadzonego tekstu. Użytkownik może przeglądać wygenerowane propozycje, edytować je, zatwierdzać wybrane i zapisywać do swojej kolekcji. Proces wykorzystuje AI do analizy tekstu i wyodrębnienia kluczowych informacji.

## 2. Routing widoku
Ścieżka: `/flashcards/generate`

## 3. Struktura komponentów
```
GenerateFlashcardsPage
├── SourceTextForm
│   ├── Textarea
│   ├── NumberInput (max_flashcards)
│   └── Button (Generuj)
├── GenerationProgress
│   ├── LoadingSpinner
│   └── Button (Anuluj)
├── FlashcardCandidateList
│   ├── FlashcardCandidateItem[]
│   │   ├── Checkbox
│   │   ├── Button (Edytuj)
│   │   └── Button (Odrzuć)
│   └── FlashcardEditForm (modal)
│       ├── Textarea (front_content)
│       ├── Textarea (back_content)
│       ├── Button (Zapisz)
│       └── Button (Anuluj)
└── SaveSelectedFlashcardsButton
```

## 4. Szczegóły komponentów

### GenerateFlashcardsPage
- Opis komponentu: Główny kontener dla całego widoku generowania fiszek, zarządza ogólnym stanem aplikacji i koordynuje interakcje między komponentami.
- Główne elementy: Komponent root zawierający wszystkie pozostałe komponenty
- Obsługiwane interakcje: Zarządzanie ogólnym stanem widoku
- Obsługiwana walidacja: Nie dotyczy
- Typy: GenerationState, FlashcardCandidateViewModel
- Propsy: Nie dotyczy (komponent najwyższego poziomu)

### SourceTextForm
- Opis komponentu: Formularz do wprowadzania tekstu źródłowego i opcji generowania
- Główne elementy: Pole tekstowe, pole liczby maksymalnych fiszek, przycisk generowania
- Obsługiwane interakcje: Wprowadzanie tekstu, zmiana liczby fiszek, wysłanie formularza
- Obsługiwana walidacja: 
  - Tekst musi mieć min. 1000 znaków
  - Tekst może mieć max. 10000 znaków
  - Liczba fiszek musi być między 1 a 30
- Typy: GenerateFlashcardsFormData
- Propsy: 
  ```typescript
  {
    onSubmit: (formData: GenerateFlashcardsFormData) => Promise<void>;
    isLoading: boolean;
  }
  ```

### GenerationProgress
- Opis komponentu: Komponent wyświetlający postęp generowania fiszek
- Główne elementy: Pasek postępu/spinner, przycisk anulowania, timer
- Obsługiwane interakcje: Anulowanie procesu generowania
- Obsługiwana walidacja: Nie dotyczy
- Typy: Nie dotyczy
- Propsy: 
  ```typescript
  {
    onCancel: () => void;
    startTime: number;
    timeout: number; // domyślnie 120000 (2 minuty)
  }
  ```

### FlashcardCandidateList
- Opis komponentu: Lista wygenerowanych propozycji fiszek
- Główne elementy: Lista elementów FlashcardCandidateItem
- Obsługiwane interakcje: Delegacja interakcji do elementów-dzieci
- Obsługiwana walidacja: Nie dotyczy
- Typy: FlashcardCandidateViewModel[]
- Propsy: 
  ```typescript
  {
    flashcards: FlashcardCandidateViewModel[];
    onSelect: (index: number) => void;
    onEdit: (index: number) => void;
    onReject: (index: number) => void;
  }
  ```

### FlashcardCandidateItem
- Opis komponentu: Pojedynczy element listy reprezentujący propozycję fiszki
- Główne elementy: Checkbox, treść przodu i tyłu fiszki, przyciski akcji
- Obsługiwane interakcje: Zaznaczanie, edycja, odrzucanie
- Obsługiwana walidacja: Nie dotyczy
- Typy: FlashcardCandidateViewModel
- Propsy: 
  ```typescript
  {
    flashcard: FlashcardCandidateViewModel;
    index: number;
    onSelect: (index: number) => void;
    onEdit: (index: number) => void;
    onReject: (index: number) => void;
  }
  ```

### FlashcardEditForm
- Opis komponentu: Formularz do edycji treści fiszki
- Główne elementy: Pola tekstowe dla przodu i tyłu fiszki, przyciski akcji
- Obsługiwane interakcje: Edycja treści, zapisywanie zmian, anulowanie edycji
- Obsługiwana walidacja: 
  - Pola przodu i tyłu nie mogą być puste
- Typy: FlashcardCandidate
- Propsy: 
  ```typescript
  {
    flashcard: FlashcardCandidate;
    onSave: (updatedFlashcard: FlashcardCandidate) => void;
    onCancel: () => void;
  }
  ```

### SaveSelectedFlashcardsButton
- Opis komponentu: Przycisk do zapisywania zatwierdzonych fiszek
- Główne elementy: Przycisk z etykietą
- Obsługiwane interakcje: Kliknięcie przycisku
- Obsługiwana walidacja: Aktywny tylko gdy jest co najmniej jedna zatwierdzona fiszka
- Typy: FlashcardCandidateViewModel[]
- Propsy: 
  ```typescript
  {
    flashcards: FlashcardCandidateViewModel[];
    onSave: () => Promise<void>;
    isLoading: boolean;
  }
  ```

## 5. Typy

```typescript
// Typy z API
type FlashcardCandidate = {
  front_content: string;
  back_content: string;
  ai_metadata: {
    model: string;
    generation_time: string;
    parameters: any;
  };
};

type GenerateFlashcardsInput = {
  source_text: string;
  options: {
    max_flashcards: number;
  };
};

type GenerateFlashcardsResponse = {
  flashcards_proposals: FlashcardCandidate[];
};

type ApproveFlashcardsRequest = {
  flashcards: FlashcardCandidate[];
};

type ApproveFlashcardsResponse = {
  approved: {
    id: string;
    front_content: string;
    back_content: string;
    source: "ai" | "semi_ai";
    ai_metadata: any;
    created_at: string;
    updated_at: string;
  }[];
  count: number;
};

// Typy dla UI
type FlashcardCandidateViewModel = FlashcardCandidate & {
  isSelected: boolean;
  isEditing: boolean;
  wasEdited: boolean;
};

type GenerationState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  flashcards: FlashcardCandidateViewModel[];
  error: string | null;
  startTime: number | null;
};

type GenerateFlashcardsFormData = {
  source_text: string;
  options: {
    max_flashcards: number;
  };
};
```

## 6. Zarządzanie stanem

Dla tego widoku zostanie zaimplementowany niestandardowy hook `useGenerateFlashcards`, który będzie zarządzał całym stanem aplikacji:

```typescript
const useGenerateFlashcards = () => {
  // Stan formularza
  const [formData, setFormData] = useState<GenerateFlashcardsFormData>({
    source_text: '',
    options: {
      max_flashcards: 10
    }
  });

  // Stan generowania
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'idle',
    flashcards: [],
    error: null,
    startTime: null
  });

  // Resetowanie stanu
  const resetState = () => {
    setGenerationState({
      status: 'idle',
      flashcards: [],
      error: null,
      startTime: null
    });
  };

  // Obsługa formularza
  const handleFormSubmit = async (data: GenerateFlashcardsFormData) => {
    try {
      setFormData(data);
      setGenerationState({
        status: 'loading',
        flashcards: [],
        error: null,
        startTime: Date.now()
      });

      // Wywołanie API z timeoutem 2 minuty
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się wygenerować fiszek');
      }
      
      const responseData: GenerateFlashcardsResponse = await response.json();
      
      // Przekształcenie odpowiedzi do modelu widoku
      const flashcardsViewModel = responseData.flashcards_proposals.map(flashcard => ({
        ...flashcard,
        isSelected: false,
        isEditing: false,
        wasEdited: false
      }));
      
      setGenerationState({
        status: 'success',
        flashcards: flashcardsViewModel,
        error: null,
        startTime: null
      });
    } catch (error) {
      setGenerationState({
        status: 'error',
        flashcards: [],
        error: error instanceof Error ? error.message : 'Nieznany błąd',
        startTime: null
      });
    }
  };

  // Anulowanie generowania
  const handleCancel = () => {
    resetState();
  };

  // Zaznaczanie/odznaczanie fiszki
  const handleSelectFlashcard = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((flashcard, i) => 
        i === index ? { ...flashcard, isSelected: !flashcard.isSelected } : flashcard
      )
    }));
  };

  // Edycja fiszki
  const handleEditFlashcard = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((flashcard, i) => 
        i === index ? { ...flashcard, isEditing: true } : flashcard
      )
    }));
  };

  // Zapisywanie edytowanej fiszki
  const handleSaveEditedFlashcard = (index: number, updatedFlashcard: FlashcardCandidate) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((flashcard, i) => 
        i === index ? { 
          ...flashcard, 
          ...updatedFlashcard, 
          isEditing: false,
          wasEdited: true,
          isSelected: true // Automatycznie zaznacz edytowaną fiszkę
        } : flashcard
      )
    }));
  };

  // Anulowanie edycji fiszki
  const handleCancelEdit = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.map((flashcard, i) => 
        i === index ? { ...flashcard, isEditing: false } : flashcard
      )
    }));
  };

  // Odrzucenie fiszki
  const handleRejectFlashcard = (index: number) => {
    setGenerationState(prev => ({
      ...prev,
      flashcards: prev.flashcards.filter((_, i) => i !== index)
    }));
  };

  // Zapisywanie zatwierdzonych fiszek
  const handleSaveSelectedFlashcards = async () => {
    try {
      const selectedFlashcards = generationState.flashcards
        .filter(flashcard => flashcard.isSelected)
        .map(({ isSelected, isEditing, wasEdited, ...rest }) => rest);
      
      if (selectedFlashcards.length === 0) {
        throw new Error('Nie wybrano żadnych fiszek do zapisania');
      }
      
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards: selectedFlashcards })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się zapisać fiszek');
      }
      
      const responseData: ApproveFlashcardsResponse = await response.json();
      
      // Resetowanie stanu po pomyślnym zapisie
      resetState();
      
      // Wyświetlenie powiadomienia o sukcesie
      // toast.success(`Zapisano ${responseData.count} fiszek`);
      
      return responseData;
    } catch (error) {
      // toast.error(error instanceof Error ? error.message : 'Nieznany błąd');
      return null;
    }
  };

  return {
    formData,
    generationState,
    handleFormSubmit,
    handleCancel,
    handleSelectFlashcard,
    handleEditFlashcard,
    handleSaveEditedFlashcard,
    handleCancelEdit,
    handleRejectFlashcard,
    handleSaveSelectedFlashcards
  };
};
```

## 7. Integracja API

### Generowanie fiszek
- **Endpoint**: `POST /api/flashcards/generate`
- **Request Body**:
  ```typescript
  {
    source_text: string; // Tekst źródłowy (1000-10000 znaków)
    options: {
      max_flashcards: number; // Opcjonalnie, 1-30, domyślnie 10
    }
  }
  ```
- **Response**:
  ```typescript
  {
    flashcards_proposals: [
      {
        front_content: string;
        back_content: string;
        ai_metadata: {
          model: string;
          generation_time: string;
          parameters: any;
        }
      }
    ]
  }
  ```
- **Obsługa błędów**:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Użytkownik nie jest uwierzytelniony
  - 429: Przekroczony limit żądań
  - 500: Wewnętrzny błąd serwera

### Zapisywanie fiszek
- **Endpoint**: `POST /api/flashcards`
- **Request Body**:
  ```typescript
  {
    flashcards: [
      {
        front_content: string;
        back_content: string;
        ai_metadata: {
          model: string;
          generation_time: string;
          parameters: any;
        }
      }
    ]
  }
  ```
- **Response**:
  ```typescript
  {
    approved: [
      {
        id: string;
        front_content: string;
        back_content: string;
        source: "ai" | "semi_ai";
        ai_metadata: any;
        created_at: string;
        updated_at: string;
      }
    ],
    count: number;
  }
  ```
- **Obsługa błędów**:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Użytkownik nie jest uwierzytelniony
  - 500: Wewnętrzny błąd serwera

## 8. Interakcje użytkownika

1. **Wprowadzanie tekstu źródłowego**
   - Użytkownik wpisuje tekst w pole tekstowe
   - System waliduje długość tekstu (min. 1000, max. 10000 znaków)
   - System wyświetla aktualną liczbę znaków
   - Przycisk "Generuj" jest aktywny tylko gdy walidacja przechodzi pomyślnie

2. **Generowanie fiszek**
   - Użytkownik klika przycisk "Generuj"
   - System wyświetla spinner/pasek postępu
   - System wysyła żądanie do API
   - System monitoruje czas generowania (max. 2 minuty)
   - Po zakończeniu system wyświetla wygenerowane propozycje fiszek

3. **Anulowanie generowania**
   - Użytkownik może anulować generowanie klikając przycisk "Anuluj"
   - System przerywa żądanie i wraca do stanu początkowego

4. **Przeglądanie propozycji fiszek**
   - System wyświetla listę propozycji fiszek z checkboxami
   - Użytkownik może zaznaczać/odznaczać poszczególne fiszki
   - Dla każdej fiszki dostępne są przyciski "Edytuj" i "Odrzuć"

5. **Edycja fiszki**
   - Użytkownik klika przycisk "Edytuj" przy wybranej fiszce
   - System wyświetla formularz edycji z aktualnymi danymi fiszki
   - Użytkownik wprowadza zmiany w treści przodu i/lub tyłu fiszki
   - Użytkownik klika "Zapisz" aby zatwierdzić zmiany
   - System oznacza edytowaną fiszkę jako "semi_ai" i automatycznie ją zaznacza

6. **Odrzucenie fiszki**
   - Użytkownik klika przycisk "Odrzuć" przy wybranej fiszce
   - System usuwa fiszkę z listy propozycji

7. **Zapisywanie zatwierdzonych fiszek**
   - Użytkownik zaznacza fiszki, które chce zachować
   - Użytkownik klika przycisk "Zapisz zatwierdzone"
   - System wysyła żądanie do API z wybranymi fiszkami
   - System wyświetla potwierdzenie zapisania fiszek
   - System resetuje widok do stanu początkowego

## 9. Warunki i walidacja

### Walidacja tekstu źródłowego
- **Warunek**: Tekst musi mieć min. 1000 znaków
- **Warunek**: Tekst może mieć max. 10000 znaków
- **Komponent**: SourceTextForm
- **Wpływ na UI**: 
  - Komunikat błędu pod polem tekstowym
  - Dezaktywacja przycisku "Generuj" jeśli walidacja nie przechodzi

### Walidacja liczby fiszek
- **Warunek**: Liczba fiszek musi być między 1 a 30
- **Komponent**: SourceTextForm
- **Wpływ na UI**: 
  - Komunikat błędu pod polem liczby
  - Dezaktywacja przycisku "Generuj" jeśli walidacja nie przechodzi

### Walidacja edycji fiszki
- **Warunek**: Pola przodu i tyłu fiszki nie mogą być puste
- **Komponent**: FlashcardEditForm
- **Wpływ na UI**: 
  - Komunikat błędu pod odpowiednim polem
  - Dezaktywacja przycisku "Zapisz" jeśli walidacja nie przechodzi

### Walidacja zapisywania fiszek
- **Warunek**: Musi być zaznaczona co najmniej jedna fiszka
- **Komponent**: SaveSelectedFlashcardsButton
- **Wpływ na UI**: 
  - Dezaktywacja przycisku "Zapisz zatwierdzone" jeśli nie wybrano żadnej fiszki
  - Podpowiedź informująca o konieczności wyboru fiszek

### Timeout generowania
- **Warunek**: Generowanie nie może trwać dłużej niż 2 minuty
- **Komponent**: GenerationProgress
- **Wpływ na UI**: 
  - Wyświetlanie pozostałego czasu
  - Automatyczne anulowanie po upływie czasu

## 10. Obsługa błędów

### Błędy generowania fiszek
1. **Tekst źródłowy zbyt krótki/długi**
   - Walidacja formularza przed wysłaniem
   - Wyświetlenie komunikatu z informacją o wymaganej długości

2. **Timeout podczas generowania**
   - Automatyczne przerwanie procesu po 2 minutach
   - Wyświetlenie komunikatu o przekroczeniu czasu
   - Możliwość ponowienia próby

3. **Błąd API (kod 400, 401, 429, 500)**
   - Mapowanie kodu błędu na przyjazny dla użytkownika komunikat
   - Wyświetlenie komunikatu z możliwością ponowienia próby
   - W przypadku błędu 429 (limit żądań) - informacja o konieczności odczekania

### Błędy zapisywania fiszek
1. **Brak zaznaczonych fiszek**
   - Dezaktywacja przycisku "Zapisz zatwierdzone"
   - Podpowiedź informująca o konieczności wyboru fiszek

2. **Błąd API (kod 400, 401, 500)**
   - Mapowanie kodu błędu na przyjazny dla użytkownika komunikat
   - Wyświetlenie komunikatu z możliwością ponowienia próby
   - Zachowanie stanu zaznaczonych fiszek

3. **Błędy walidacji**
   - Wyświetlenie komunikatów błędów w odpowiednich miejscach formularza
   - Wskazanie pól wymagających poprawy

## 11. Kroki implementacji

1. **Przygotowanie typów danych**
   - Zdefiniowanie typów FlashcardCandidate, GenerateFlashcardsInput, GenerateFlashcardsResponse
   - Zdefiniowanie typów UI: FlashcardCandidateViewModel, GenerationState, GenerateFlashcardsFormData

2. **Implementacja hooka useGenerateFlashcards**
   - Implementacja logiki zarządzania stanem
   - Implementacja funkcji obsługi interakcji
   - Implementacja integracji z API

3. **Implementacja komponentu GenerateFlashcardsPage**
   - Utworzenie głównego layoutu strony
   - Integracja z hookiem useGenerateFlashcards

4. **Implementacja komponentu SourceTextForm**
   - Implementacja pola tekstowego z walidacją
   - Implementacja pola liczby maksymalnych fiszek
   - Implementacja przycisku generowania

5. **Implementacja komponentu GenerationProgress**
   - Implementacja paska postępu/spinnera
   - Implementacja timera z odliczaniem
   - Implementacja przycisku anulowania

6. **Implementacja komponentów FlashcardCandidateList i FlashcardCandidateItem**
   - Implementacja listy fiszek
   - Implementacja checkboxów do zaznaczania
   - Implementacja przycisków akcji (edycja, odrzucenie)

7. **Implementacja komponentu FlashcardEditForm**
   - Implementacja formularza edycji
   - Implementacja walidacji pól
   - Implementacja przycisków akcji (zapisz, anuluj)

8. **Implementacja komponentu SaveSelectedFlashcardsButton**
   - Implementacja przycisku zapisywania
   - Implementacja logiki aktywacji/dezaktywacji

9. **Integracja z powiadomieniami Toast**
   - Implementacja powiadomień o sukcesie i błędach

10. **Testowanie i dopracowanie UX**
    - Testowanie wszystkich interakcji
    - Dopracowanie dostępności (labelki, aria-atrybuty)
    - Dopracowanie responsywności

11. **Optymalizacja wydajności**
    - Memorizacja komponentów (React.memo)
    - Optymalizacja renderowania listy fiszek
    - Obsługa dużych tekstów wejściowych 