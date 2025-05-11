# Schemat bazy danych PostgreSQL dla 10xCards

## 1. Tabele

### 1.1. users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### 1.2. flashcards

```sql
CREATE TYPE flashcard_source AS ENUM ('manual', 'ai', 'semi_ai');

CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    front_content TEXT NOT NULL CHECK (char_length(front_content) <= 200),
    back_content TEXT NOT NULL CHECK (char_length(back_content) <= 200),
    source flashcard_source NOT NULL DEFAULT 'manual',
    ai_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_ai_metadata CHECK (
        (source = 'ai' OR source = 'semi_ai') AND ai_metadata IS NOT NULL
        OR
        source = 'manual'
    )
);

CREATE INDEX flashcards_user_id_idx ON flashcards(user_id);

CREATE TRIGGER update_flashcards_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to change source to semi_ai when editing AI-generated flashcards
CREATE OR REPLACE FUNCTION update_flashcard_source()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.source = 'ai' AND
       (OLD.front_content != NEW.front_content OR OLD.back_content != NEW.back_content) THEN
        NEW.source = 'semi_ai';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flashcard_source_trigger
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_flashcard_source();
```

### 1.3. flashcard_reviews

```sql
CREATE TABLE flashcard_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    quality_response SMALLINT NOT NULL CHECK (quality_response >= 0 AND quality_response <= 5),
    easiness_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5 CHECK (easiness_factor >= 1.3),
    interval INTEGER NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX flashcard_reviews_flashcard_id_idx ON flashcard_reviews(flashcard_id);
CREATE INDEX flashcard_reviews_next_review_date_idx ON flashcard_reviews(next_review_date);
```

### 1.4. study_sessions

```sql
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    cards_reviewed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX study_sessions_start_time_idx ON study_sessions(start_time);
```

### 1.5. session_reviews

```sql
CREATE TABLE session_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    flashcard_review_id UUID REFERENCES flashcard_reviews(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(study_session_id, flashcard_id)
);

CREATE INDEX session_reviews_study_session_id_idx ON session_reviews(study_session_id);
CREATE INDEX session_reviews_flashcard_id_idx ON session_reviews(flashcard_id);
```

### 1.6. system_logs

```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    error_code VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    model VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX system_logs_user_id_idx ON system_logs(user_id);
CREATE INDEX system_logs_error_code_idx ON system_logs(error_code);
CREATE INDEX system_logs_created_at_idx ON system_logs(created_at);
```

## 2. Relacje

1. **users → flashcards**: Jeden-do-wielu (1:N)

   - Użytkownik może mieć wiele fiszek
   - Każda fiszka należy do jednego użytkownika

2. **flashcards → flashcard_reviews**: Jeden-do-wielu (1:N)

   - Fiszka może mieć wiele przeglądów
   - Każdy przegląd dotyczy jednej fiszki

3. **users → study_sessions**: Jeden-do-wielu (1:N)

   - Użytkownik może mieć wiele sesji nauki
   - Każda sesja nauki należy do jednego użytkownika

4. **study_sessions → session_reviews**: Jeden-do-wielu (1:N)

   - Sesja nauki może mieć wiele przeglądów
   - Każdy przegląd sesji należy do jednej sesji nauki

5. **flashcards → session_reviews**: Jeden-do-wielu (1:N)

   - Fiszka może być przeglądana w wielu sesjach
   - Każdy przegląd sesji dotyczy jednej fiszki

6. **flashcard_reviews → session_reviews**: Jeden-do-jednego (1:1)

   - Przegląd fiszki może być powiązany z jednym przeglądem sesji
   - Przegląd sesji może być powiązany z jednym przeglądem fiszki

7. **users → system_logs**: Jeden-do-wielu (1:N)
   - Użytkownik może mieć wiele wpisów w logach
   - Każdy wpis w logach może być powiązany z jednym użytkownikiem (lub z żadnym)

## 3. Indeksy

- **users**: Brak dodatkowych indeksów (poza PRIMARY KEY)
- **flashcards**: indeks na user_id
- **flashcard_reviews**: indeksy na flashcard_id i next_review_date
- **study_sessions**: indeksy na user_id i start_time
- **session_reviews**: indeksy na study_session_id i flashcard_id
- **system_logs**: indeksy na user_id, error_code i created_at

## 4. Zasady Row Level Security (RLS)

```sql
-- Włączenie RLS dla wszystkich tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Zasady dla users
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Zasady dla flashcards
CREATE POLICY flashcards_select_own ON flashcards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY flashcards_insert_own ON flashcards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY flashcards_update_own ON flashcards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY flashcards_delete_own ON flashcards
    FOR DELETE USING (auth.uid() = user_id);

-- Zasady dla flashcard_reviews
CREATE POLICY flashcard_reviews_select_own ON flashcard_reviews
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM flashcards WHERE id = flashcard_id)
    );

CREATE POLICY flashcard_reviews_insert_own ON flashcard_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM flashcards WHERE id = flashcard_id)
    );

CREATE POLICY flashcard_reviews_update_own ON flashcard_reviews
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id FROM flashcards WHERE id = flashcard_id)
    );

CREATE POLICY flashcard_reviews_delete_own ON flashcard_reviews
    FOR DELETE USING (
        auth.uid() = (SELECT user_id FROM flashcards WHERE id = flashcard_id)
    );

-- Zasady dla study_sessions
CREATE POLICY study_sessions_select_own ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY study_sessions_insert_own ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY study_sessions_update_own ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY study_sessions_delete_own ON study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Zasady dla session_reviews
CREATE POLICY session_reviews_select_own ON session_reviews
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM study_sessions WHERE id = study_session_id
        )
    );

CREATE POLICY session_reviews_insert_own ON session_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = (
            SELECT user_id FROM study_sessions WHERE id = study_session_id
        )
    );

CREATE POLICY session_reviews_update_own ON session_reviews
    FOR UPDATE USING (
        auth.uid() = (
            SELECT user_id FROM study_sessions WHERE id = study_session_id
        )
    );

CREATE POLICY session_reviews_delete_own ON session_reviews
    FOR DELETE USING (
        auth.uid() = (
            SELECT user_id FROM study_sessions WHERE id = study_session_id
        )
    );

-- Zasady dla system_logs
-- Tylko administratorzy mają dostęp do logów
CREATE POLICY system_logs_admin_select ON system_logs
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM users WHERE email LIKE '%@admin.com'
    ));
```

## 5. Dodatkowe uwagi

1. **Autentykacja użytkowników**: Schemat wykorzystuje mechanizm autentykacji Supabase i RLS. Brak kolumny na przechowywanie haseł, ponieważ Supabase zarządza autentykacją.

2. **AI Metadata**: Pole `ai_metadata` w tabeli `flashcards` jest typu JSONB i może przechowywać różne metadane związane z generowaniem fiszek przez AI, takie jak:
   - model - nazwa modelu AI używanego do generowania
   - generation_time - czas generowania
   - parameters - parametry użyte podczas generowania
   - prompt - zastosowany prompt
3. **Algorytm SM-2**: Implementacja algorytmu SuperMemo 2 (SM-2) dla powtórek jest obsługiwana przez tabelę `flashcard_reviews`:

   - easiness_factor - współczynnik łatwości (minimum 1.3, domyślnie 2.5)
   - interval - interwał w dniach do następnej powtórki
   - repetitions - liczba powtórek
   - quality_response - ocena jakości odpowiedzi (0-5)
   - next_review_date - data następnej powtórki

4. **Zakończenie sesji nauki**: Pole `end_time` w tabeli `study_sessions` początkowo jest NULL i powinno być aktualizowane po zakończeniu sesji.

5. **Śledzenie przeglądów w sesji**: Tabela `session_reviews` łączy sesje nauki, fiszki i przeglądy fiszek, umożliwiając śledzenie, które fiszki były przeglądane w danej sesji.

6. **Walidacja**: Na polach tekstowych fiszek zastosowano ograniczenia długości (max 200 znaków).

7. **Kaskadowe usuwanie**: Użyto `ON DELETE CASCADE` dla utrzymania integralności danych przy usuwaniu rekordów (np. usunięcie użytkownika usunie wszystkie jego fiszki).

8. **Automatyczna aktualizacja pól czasowych**: Zastosowano wyzwalacze do automatycznej aktualizacji pola `updated_at`.

9. **Wyzwalacz zmiany źródła fiszki**: Automatyczna zmiana wartości `source` na 'semi_ai' przy edycji fiszki wygenerowanej przez AI.

10. **System logowania**: Tabela `system_logs` przechowuje podstawowe informacje o błędach systemowych:
    - error_code: Kod błędu pozwalający na łatwą identyfikację rodzaju problemu
    - error_message: Szczegółowy opis błędu
    - model: Opcjonalna informacja o modelu AI, jeśli błąd dotyczy usługi AI
    - Dostępna tylko dla administratorów poprzez RLS
