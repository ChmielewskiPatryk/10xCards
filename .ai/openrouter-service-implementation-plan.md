# Plan Wdrożenia Usługi OpenRouter

## 1. Opis Usługi

Usługa OpenRouter będzie odpowiedzialna za komunikację z API OpenRouter.ai w celu wykonywania zapytań do różnych modeli LLM (Large Language Models). Usługa ta zostanie zaimplementowana zgodnie z architekturą projektu, wykorzystując TypeScript i będzie dostępna jako moduł w `src/lib/openrouter`.

Główne funkcjonalności:

- Komunikacja z API OpenRouter
- Korzystanie tylko z jednego modelu - gpt4.0
- Obsługa sesji czatu
- Formatowanie zapytań i odpowiedzi
- Obsługa błędów i ponownych prób

## 2. Opis Konstruktora

```typescript
class OpenRouterClient {
  constructor(config: {
    apiKey: string;
    defaultModel?: string;
    baseUrl?: string;
    defaultParameters?: OpenRouterParameters;
    timeout?: number;
    maxRetries?: number;
  }) {
    // Inicjalizacja klienta
  }
}
```

- `apiKey` - Klucz API OpenRouter (wymagany)
- `defaultModel` - Domyślny model do wykorzystania (opcjonalny)
- `baseUrl` - URL bazowy API (opcjonalny, domyślnie "https://openrouter.ai/api/v1")
- `defaultParameters` - Domyślne parametry dla wszystkich zapytań (opcjonalne)
- `timeout` - Limit czasu dla zapytań w milisekundach (opcjonalny, domyślnie 30000)
- `maxRetries` - Maksymalna liczba ponownych prób (opcjonalna, domyślnie 3)

## 3. Publiczne Metody i Pola

### 3.1. Zarządzanie Wiadomościami

```typescript
async sendMessage(
  message: string | MessageContent,
  options?: MessageOptions
): Promise<OpenRouterResponse>
```

Wysyła pojedynczą wiadomość do modelu.

```typescript
async sendChatMessages(
  messages: OpenRouterMessage[],
  options?: MessageOptions
): Promise<OpenRouterResponse>
```

Wysyła pełną historię konwersacji do modelu.

```typescript
setSystemMessage(message: string): void
```

Ustawia wiadomość systemową dla wszystkich zapytań.

### 3.2. Obsługa Formatowanych Odpowiedzi

```typescript
async sendMessageWithFormat(
  message: string | MessageContent,
  responseFormat: ResponseFormat,
  options?: MessageOptions
): Promise<OpenRouterResponse>
```

Wysyła wiadomość z określonym formatem odpowiedzi.

```typescript
registerJsonSchema(
  name: string,
  schema: object,
  strict: boolean = true
): ResponseFormat
```

Rejestruje schemat JSON do wielokrotnego użytku.

### 3.4. Konfiguracja Parametrów

```typescript
setDefaultParameters(parameters: OpenRouterParameters): void
```

Ustawia domyślne parametry dla wszystkich zapytań.

```typescript
getModelDefaults(modelName: string): OpenRouterParameters
```

Pobiera zalecane parametry dla konkretnego modelu.

## 4. Prywatne Metody i Pola

```typescript
private async makeRequest(
  endpoint: string,
  payload: object,
  retryCount: number = 0
): Promise<any>
```

Wykonuje zapytanie HTTP do API OpenRouter z obsługą ponownych prób.

```typescript
private buildMessages(
  message: string | MessageContent,
  systemMessage?: string
): OpenRouterMessage[]
```

Buduje tablicę wiadomości z odpowiednim formatowaniem.

```typescript
private handleError(error: any): never
```

Przetwarza błędy API i rzuca odpowiednie wyjątki.

```typescript
private validateResponseFormat(responseFormat: ResponseFormat): void
```

Sprawdza poprawność formatu odpowiedzi.

## 5. Obsługa Błędów

Usługa powinna implementować kompleksową obsługę błędów dla następujących scenariuszy:

1. **Błędy autentykacji API**

   - Nieprawidłowy klucz API
   - Wygaśnięcie klucza API

2. **Ograniczenia szybkości**

   - Przekroczenie limitów zapytań
   - Implementacja mechanizmu wykładniczego wycofania

3. **Niedostępność modelu**

   - Model tymczasowo niedostępny
   - Model usunięty z OpenRouter

4. **Błędy formatu zapytania**

   - Nieprawidłowe parametry
   - Nieprawidłowy format wiadomości

5. **Błędy parsowania odpowiedzi**

   - Nieprawidłowy format JSON
   - Niezgodność ze schematem

6. **Problemy z połączeniem**

   - Timeout
   - Zerwane połączenie
   - Błędy DNS

7. **Przekroczenie kwoty**

   - Wyczerpanie środków na koncie
   - Przekroczenie limitów użycia

8. **Naruszenia polityki treści**
   - Treść uznana za niebezpieczną
   - Treść niezgodna z warunkami użytkowania

## 6. Kwestie Bezpieczeństwa

1. **Zarządzanie kluczami API**

   - Nigdy nie przechowuj kluczy API w kodzie źródłowym
   - Użyj zmiennych środowiskowych lub bezpiecznego magazynu Supabase
   - Implementuj rotację kluczy i monitorowanie użycia

2. **Sanityzacja danych wejściowych**

   - Waliduj wszystkie dane wejściowe przed wysłaniem do API
   - Zapobiegaj atakom typu injection poprzez odpowiednie formatowanie

3. **Bezpieczne przechowywanie rozmów**

   - Implementuj odpowiednie szyfrowanie dla przechowywanych rozmów
   - Zapewnij zgodność z RODO i innymi przepisami dotyczącymi prywatności

4. **Limitowanie dostępu**

   - Implementuj odpowiednie kontrole dostępu do usługi
   - Monitoruj i ogranicz użycie na poziomie użytkownika

5. **Obsługa danych wrażliwych**
   - Zapewnij mechanizmy redakcji danych wrażliwych
   - Implementuj politykę retencji danych
