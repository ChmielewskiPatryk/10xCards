# API Endpoint Implementation Plan: GET /api/flashcards/:id

## 1. Overview of the Endpoint
This endpoint is used to retrieve the details of a single flashcard belonging to the logged-in user based on its identifier.

## 2. Request Details
- HTTP Method: GET
- URL Structure: `/api/flashcards/:id`
- Parameters:
  - Required:
    - `id` (UUID) — the flashcard identifier in the URL path.
  - Optional: none
- Request Body: none

## 3. Response Details
- Success (200 OK):
  - Body (JSON):
    ```json
    {
      "id": "uuid",
      "front_content": "string",
      "back_content": "string",
      "source": "string",
      "ai_metadata": {} | null,
      "created_at": "string",
      "updated_at": "string"
    }
    ```
- Errors:
  - 401 Unauthorized — when missing or invalid token.
  - 404 Not Found — when the flashcard does not exist or belongs to another user.
  - 500 Internal Server Error — unexpected server-side error.

## 4. Data Flow
1. **Authentication Middleware** (Astro) verifies JWT and places `supabase` instance and `userId` in `context.locals`.
2. **Handler** in `src/pages/api/flashcards/[id].ts`:
   - Parses `id` from `params` and validates as UUID (Zod library).
   - Calls service: `FlashcardService.getById(userId, id)`.
3. **FlashcardService** (`src/lib/services/flashcardService.ts`):
   - Uses `locals.supabase`:
     ```ts
     const { data, error } = await supabase
       .from('flashcards')
       .select('id, front_content, back_content, source, ai_metadata, created_at, updated_at')
       .eq('id', id)
       .single();
     ```
   - If no row: throws `NotFoundError`.
4. **Handler**:
   - Returns 200 status with `data`.
   - Converts `NotFoundError` to 404.
   - Other exceptions → 500 + logging.

## 5. Security Considerations
- **Validation**: `id` as UUID prevents injection (Zod).
- **Data Protection**: We do not return `user_id` field, only allowed columns.

## 6. Error Handling
- 401 Unauthorized — missing/invalid Authorization header.
- 400 Bad Request — `id` is not a valid UUID (ZodError).
- 404 Not Found — no flashcard (thrown `NotFoundError`).
- 500 Internal Server Error — catch-all; before returning the response, log errors to `system_logs` table:
  ```ts
  await supabase
    .from('system_logs')
    .insert({ user_id: userId, error_code: 'GET_FLASHCARD_ERROR', error_message: error.message, model: null });
  ```

## 7. Performance
- Query by indexed primary key (`id`).
- Minimal set of columns fetched.
- In the future — possibility to add cache (CDN / edge caching in Astro).

## 8. Implementation Steps
1. **DTO/Types**: Ensure that in `src/types.ts` there is a `Flashcard` type matching the returned structure.
2. **Service**: Create `src/lib/services/flashcardService.ts` with method:
   ```ts
   async function getById(userId: string, id: string): Promise<Flashcard> { ... }
   ```
3. **Handler**: Create file `src/pages/api/flashcards/[id].ts`:
   - Import Zod and types.
   - Extract `id` from `params`, perform validation.
   - Call `FlashcardService.getById`.
   - Handle response codes.
4. **Middleware**: Secure endpoint using Supabase Auth and context (Astro).
5. **Error Logging**: Implement writing to `system_logs` in case of 500.
6. **Testing**:
   - Unit tests for `FlashcardService`.
7. **Documentation**: Update OpenAPI/README with description of the new endpoint.
8. **Code Review**: Code review according to rules from `shared.mdc`, `backend.mdc`, `astro.mdc`.
