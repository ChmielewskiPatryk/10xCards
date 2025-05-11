# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Overview of the Endpoint

The endpoint allows an authenticated user to create a new flashcard in the system. Data is stored in the `flashcards` table in Supabase, following the default rules and triggers (defaults for `id`, `source`, `created_at`, `updated_at`).

## 2. Request Details

- HTTP Method: POST
- Path: `/api/flashcards`
- Headers:
  - `Content-Type: application/json`
- Parameters:
  - Required:
    - `front_content` (string, max 200 characters)
    - `back_content` (string, max 200 characters)
  - Optional: none
- Request body example:
  ```json
  {
    "front_content": "What is functional programming?",
    "back_content": "A paradigm based on functions as first-class values."
  }
  ```

## 3. Types Used

- DTO / Command:
  - `CreateFlashcardCommand` (from `src/types.ts`):
    ```ts
    type CreateFlashcardCommand = {
      front_content: string;
      back_content: string;
    };
    ```
- Returned Model:
  - `Flashcard` (from `src/types.ts`):
    ```ts
    type Flashcard = {
      id: string;
      front_content: string;
      back_content: string;
      source: "manual" | "ai" | "semi_ai";
      ai_metadata: object | null;
      created_at: string;
      updated_at: string;
    };
    ```

## 4. Response Details

- Success (201 Created):
  ```json
  {
    "id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "source": "manual",
    "ai_metadata": null,
    "created_at": "2024-06-01T12:00:00Z",
    "updated_at": "2024-06-01T12:00:00Z"
  }
  ```
- Error Codes:
  - 400 Bad Request – invalid input data (Zod validation)
  - 401 Unauthorized – missing or invalid authorization token
  - 500 Internal Server Error – server or database error

## 5. Data Flow

1. Client sends POST /api/flashcards with JSON.
2. Astro Server Endpoint (`src/pages/api/flashcards.ts`) loads `supabase` from `context.locals`.
3. Parses and validates the body using Zod (schema limiting type and length).
4. Calls `flashcardsService.createFlashcard(command, userId)`:
   - Uses SupabaseClient to `insert` into the `flashcards` table with `user_id = auth.uid()` and fields from the command.
5. Supabase returns the created record (trigger sets `id`, `source`, `created_at`, `updated_at`).
6. Endpoint maps the result to `Flashcard` and returns 201 + JSON.

## 6. Security Considerations

- Input validation: Zod schema protects against empty or too long strings.
- SQL Injection protection: using Supabase SDK.

## 7. Error Handling

| Status | Cause                              | Action                                                              |
| ------ | ---------------------------------- | ------------------------------------------------------------------- |
| 400    | Zod.validate failed                | Return JSON with validation description                             |
| 401    | Missing or invalid token           | Return `{ error: 'Unauthorized'}`                                   |
| 500    | Insert error / unhandled exception | Log to `system_logs` and return `{ error: 'Internal Server Error'}` |

## 8. Performance Considerations

- Operation is a single `INSERT` → minimal load.
- Index on `user_id` supports future GET queries.
- Avoid unnecessary reads – return only the created record.

## 9. Deployment Steps

1. **Define Zod schema** for `CreateFlashcardCommand` in `src/pages/api/flashcards.ts`.
2. **Create service** `flashcardsService.createFlashcard` in `src/lib/services/flashcards.service.ts`.
3. **Implement Endpoint**:
   - new file `src/pages/api/flashcards.ts`
   - `export const prerender = false` and `export const POST`
   - inserting guard clauses and mapping results.
4. **Logging errors**: add helper to write to `system_logs` in `src/lib/services/logging.service.ts`.
5. **Unit tests** for:
   - successful flashcard creation
   - Zod validation (400)
   - database error handling (500)
6. **Code review & lint**: check compliance with `shared.mdc`, `backend.mdc`, `astro.mdc`.
7. **Documentation**: update `api-plan.md` and `README.md` with the endpoint.
8. **Deployment**: deploy to staging → manual testing → production.
