# Plan implementacji widoku ręcznego tworzenia fiszek

## 1. Przegląd
Widok ręcznego tworzenia fiszek umożliwia użytkownikom samodzielne tworzenie nowych fiszek edukacyjnych poprzez wprowadzenie treści przedniej i tylnej strony fiszki. Zgodnie z PRD i user story US-006, funkcjonalność ta pozwala użytkownikom uzupełniać swoje zestawy o własne materiały, poza fiszkami generowanymi automatycznie przez AI.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/flashcards/new`, co jest zgodne z dostarczonym opisem widoku.

## 3. Struktura komponentów
```
ManualFlashcardPage (Astro)
└── ManualFlashcardForm (React)
    ├── FormField (Shadcn/ui) - dla front_content
    ├── FormField (Shadcn/ui) - dla back_content
    ├── Button - Submit (Shadcn/ui)
    ├── Button - Cancel (Shadcn/ui)
    ├── ConfirmDialog (Shadcn/ui)
    └── Toast/Notification (Shadcn/ui)
```

## 4. Szczegóły komponentów

### ManualFlashcardPage (Astro)
- **Opis komponentu**: Komponent strony Astro, który zawiera layout i renderuje interaktywny komponent React do tworzenia fiszek.
- **Główne elementy**: Layout aplikacji, nagłówek strony, komponent ManualFlashcardForm.
- **Obsługiwane interakcje**: Brak (delegowane do komponentu React).
- **Obsługiwana walidacja**: Brak (delegowane do komponentu React).
- **Typy**: Brak specyficznych typów dla tego komponentu.
- **Propsy**: Brak (komponent strony).

### ManualFlashcardForm (React)
- **Opis komponentu**: Interaktywny formularz React wykorzystujący react-hook-form i Zod do walidacji danych wejściowych.
- **Główne elementy**: 
  - FormField dla front_content (TextArea)
  - FormField dla back_content (TextArea)
  - Przyciski akcji (zapisz, anuluj)
  - Licznik znaków dla każdego pola
  - ConfirmDialog do potwierdzenia zapisu
  - Toast do powiadomień
- **Obsługiwane interakcje**: 
  - Zmiana zawartości pól formularza
  - Przesłanie formularza
  - Anulowanie operacji
  - Potwierdzenie zapisu
- **Obsługiwana walidacja**: 
  - Pole front_content jest wymagane i nie może przekraczać 200 znaków
  - Pole back_content jest wymagane i nie może przekraczać 200 znaków
  - Walidacja inline podczas wprowadzania danych
  - Walidacja przy próbie przesłania formularza
- **Typy**: 
  - FormData
  - FlashcardFormSchema
  - FormState
- **Propsy**: Brak (komponent autonomiczny).

### ConfirmDialog (Shadcn/ui)
- **Opis komponentu**: Dialog potwierdzający chęć zapisania fiszki.
- **Główne elementy**: Tytuł, opis, przyciski potwierdzenia i anulowania.
- **Obsługiwane interakcje**: Potwierdzenie lub anulowanie operacji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: ConfirmDialogProps.
- **Propsy**: 
  - isOpen: boolean
  - onConfirm: () => void
  - onCancel: () => void
  - title: string
  - description: string

### Toast/Notification (Shadcn/ui)
- **Opis komponentu**: Komponent powiadomień do wyświetlania informacji o sukcesie lub błędach.
- **Główne elementy**: Treść powiadomienia, ikony statusu, przycisk zamknięcia.
- **Obsługiwane interakcje**: Zamknięcie powiadomienia.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Standardowe typy komponentu Toast z biblioteki Shadcn/ui.
- **Propsy**: Standardowe propsy komponentu Toast.

## 5. Typy

### CreateFlashcardCommand (istniejący typ)
```typescript
export type CreateFlashcardCommand = {
  front_content: string;
  back_content: string;
};
```

### FlashcardFormSchema (nowy typ dla Zod)
```typescript
const FlashcardFormSchema = z.object({
  front_content: z.string()
    .min(1, "Treść przedniej strony jest wymagana")
    .max(200, "Treść przedniej strony nie może przekraczać 200 znaków"),
  back_content: z.string()
    .min(1, "Treść tylnej strony jest wymagana")
    .max(200, "Treść tylnej strony nie może przekraczać 200 znaków"),
});

type FormData = z.infer<typeof FlashcardFormSchema>;
```

### FormState (nowy typ dla zarządzania stanem formularza)
```typescript
interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}
```

### ConfirmDialogProps (nowy interfejs dla dialogu potwierdzenia)
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
}
```

## 6. Zarządzanie stanem

Dla tego widoku potrzebny będzie niestandardowy hook `useFlashcardForm`, który będzie zarządzał:
- Stanem formularza (react-hook-form)
- Stanem dialogu potwierdzenia (otwarte/zamknięte)
- Stanem przesyłania danych (isSubmitting)
- Obsługą sukcesu i błędów

```typescript
const useFlashcardForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(FlashcardFormSchema),
    defaultValues: {
      front_content: '',
      back_content: ''
    }
  });
  
  // Funkcja wywołana przy próbie przesłania formularza
  const onSubmit = (data: FormData) => {
    setIsDialogOpen(true);
  };
  
  // Funkcja wywołana po potwierdzeniu w dialogu
  const handleConfirm = async () => {
    const data = form.getValues();
    setFormState({ isSubmitting: true, isSuccess: false, error: null });
    
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd podczas zapisywania fiszki');
      }
      
      setFormState({ isSubmitting: false, isSuccess: true, error: null });
      toast({
        title: 'Sukces',
        description: 'Fiszka została pomyślnie zapisana',
        variant: 'success',
      });
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieznany błąd';
      setFormState({ isSubmitting: false, isSuccess: false, error: errorMessage });
      toast({
        title: 'Błąd',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    setIsDialogOpen(false);
  };
  
  // Funkcja do anulowania operacji
  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  
  return {
    form,
    formState,
    isDialogOpen,
    onSubmit: form.handleSubmit(onSubmit),
    handleConfirm,
    handleCancel
  };
};
```

## 7. Integracja API

Widok będzie korzystał z endpointu `POST /api/flashcards` do tworzenia nowych fiszek.

### Przebieg integracji
1. Dane formularza są walidowane lokalnie przez Zod
2. Po walidacji i potwierdzeniu przez użytkownika, dane są wysyłane do API
3. API przetwarza żądanie i zwraca nowo utworzoną fiszkę lub błąd

### Szczegóły żądania
- **URL**: `/api/flashcards`
- **Metoda**: POST
- **Nagłówki**: `Content-Type: application/json`
- **Body**:
  ```typescript
  {
    front_content: string; // Treść przedniej strony fiszki
    back_content: string;  // Treść tylnej strony fiszki
  }
  ```

### Szczegóły odpowiedzi
- **Sukces (201 Created)**:
  ```typescript
  {
    id: string;
    front_content: string;
    back_content: string;
    source: "manual";
    ai_metadata: null;
    created_at: string;
    updated_at: string;
  }
  ```
- **Błąd (400, 401, 500)**:
  ```typescript
  {
    error: string;
    details?: any;
  }
  ```

## 8. Interakcje użytkownika

### 1. Wprowadzanie treści fiszki
- Użytkownik wprowadza tekst w pola front_content i back_content
- System na bieżąco waliduje dane i wyświetla licznik znaków
- W przypadku przekroczenia limitu znaków, pole jest oznaczane jako błędne

### 2. Przesłanie formularza
- Użytkownik klika przycisk "Zapisz fiszkę"
- System waliduje cały formularz
- Jeśli dane są poprawne, wyświetlany jest dialog potwierdzenia
- Jeśli dane są niepoprawne, wyświetlane są komunikaty błędów

### 3. Potwierdzenie zapisu
- Użytkownik potwierdza chęć zapisania fiszki w dialogu
- System wyświetla stan ładowania
- Po udanym zapisie:
  - Wyświetlane jest powiadomienie o sukcesie
  - Formularz jest czyszczony
- W przypadku błędu wyświetlane jest powiadomienie o błędzie

### 4. Anulowanie operacji
- Użytkownik może anulować operację na każdym etapie
- W dialogu potwierdzenia: klikając "Anuluj"
- W formularzu: klikając przycisk "Anuluj" (opcjonalnie)

## 9. Warunki i walidacja

### Walidacja pola front_content
- **Komponent**: FormField dla front_content
- **Warunki**:
  - Pole jest wymagane
  - Maksymalna długość: 200 znaków
- **Wpływ na UI**:
  - Komunikat błędu przy pustym polu
  - Licznik znaków ze zmianą koloru przy zbliżaniu się do limitu
  - Zablokowanie możliwości wprowadzania tekstu po osiągnięciu limitu

### Walidacja pola back_content
- **Komponent**: FormField dla back_content
- **Warunki**:
  - Pole jest wymagane
  - Maksymalna długość: 200 znaków
- **Wpływ na UI**:
  - Komunikat błędu przy pustym polu
  - Licznik znaków ze zmianą koloru przy zbliżaniu się do limitu
  - Zablokowanie możliwości wprowadzania tekstu po osiągnięciu limitu

### Walidacja formularza
- **Komponent**: ManualFlashcardForm
- **Warunki**:
  - Wszystkie pola muszą spełniać swoje warunki walidacji
- **Wpływ na UI**:
  - Przycisk "Zapisz" jest nieaktywny, gdy formularz zawiera błędy
  - Przy próbie przesłania niepoprawnego formularza wyświetlane są wszystkie błędy

## 10. Obsługa błędów

### Błędy walidacji formularza
- **Obsługa**: Inline validation przez react-hook-form i Zod
- **UI**: Komunikaty błędów pod polami formularza

### Błędy API
- **400 Bad Request**:
  - Wyświetlenie szczegółowego komunikatu błędu z API
  - Podświetlenie problematycznych pól
- **401 Unauthorized**:
  - Przekierowanie do strony logowania lub wyświetlenie komunikatu o konieczności zalogowania
- **500 Internal Server Error**:
  - Wyświetlenie ogólnego komunikatu o błędzie serwera
  - Możliwość ponownej próby

### Błędy sieci
- Wyświetlenie komunikatu o problemach z połączeniem
- Możliwość ponownej próby przesłania formularza
- Zachowanie wprowadzonych danych

## 11. Kroki implementacji

1. **Utworzenie pliku strony Astro**
   - Utwórz plik `src/pages/flashcards/new.astro`
   - Zaimplementuj podstawową strukturę strony z layoutem

2. **Implementacja komponentu ManualFlashcardForm**
   - Utwórz plik `src/components/ManualFlashcardForm.tsx`
   - Zdefiniuj schemat walidacji Zod
   - Zaimplementuj hook `useFlashcardForm`
   - Zbuduj strukturę formularza z komponentami Shadcn/ui

3. **Implementacja ConfirmDialog**
   - Dostosuj komponent z biblioteki Shadcn/ui lub utwórz własny
   - Zintegruj z ManualFlashcardForm

4. **Konfiguracja Toasts/Powiadomień**
   - Skonfiguruj provider powiadomień
   - Zintegruj z funkcjami obsługi formularza

5. **Integracja z API**
   - Zaimplementuj funkcję wysyłania danych do endpointu
   - Obsłuż wszystkie możliwe scenariusze odpowiedzi

6. **Stylowanie i UX**
   - Zastosuj klasy Tailwind dla estetycznego wyglądu
   - Dodaj liczniki znaków
   - Upewnij się, że interfejs jest intuicyjny i dostępny

7. **Testowanie**
   - Przetestuj wszystkie scenariusze walidacji
   - Przetestuj interakcje użytkownika
   - Przetestuj integrację z API

8. **Dodatkowe ulepszenia UX**
   - Dodaj przechowywanie stanu formularza w localStorage
   - Dodaj obsługę klawiatury dla lepszej dostępności
   - Zaimplementuj responsywny design dla różnych urządzeń
</rewritten_file> 