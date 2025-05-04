-- Migration: Initial Schema Creation
-- Description: Creates the initial database schema for 10xCards application
-- Tables: flashcards, flashcard_reviews, study_sessions, session_reviews, system_logs
-- Author: System
-- Date: 2024-03-20

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create flashcard source enum
create type flashcard_source as enum ('manual', 'ai', 'semi_ai');

-- Create flashcards table
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front_content text not null check (char_length(front_content) <= 200),
    back_content text not null check (char_length(back_content) <= 200),
    source flashcard_source not null default 'manual',
    ai_metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    constraint valid_ai_metadata check (
        (source = 'ai' or source = 'semi_ai') and ai_metadata is not null
        or
        source = 'manual'
    )
);

-- Create index on flashcards
create index flashcards_user_id_idx on flashcards(user_id);

-- Create trigger function for updating updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for flashcards table
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at();

-- Create trigger function for updating flashcard source
create or replace function update_flashcard_source()
returns trigger as $$
begin
    if old.source = 'ai' and 
       (old.front_content != new.front_content or old.back_content != new.back_content) then
        new.source = 'semi_ai';
    end if;
    return new;
end;
$$ language plpgsql;

-- Create trigger for updating flashcard source
create trigger update_flashcard_source_trigger
    before update on flashcards
    for each row
    execute function update_flashcard_source();

-- Create flashcard_reviews table
create table flashcard_reviews (
    id uuid primary key default gen_random_uuid(),
    flashcard_id uuid not null references flashcards(id) on delete cascade,
    quality_response smallint not null check (quality_response >= 0 and quality_response <= 5),
    easiness_factor decimal(4,2) not null default 2.5 check (easiness_factor >= 1.3),
    interval integer not null default 0,
    repetitions integer not null default 0,
    next_review_date date not null default current_date,
    reviewed_at timestamptz not null default now()
);

-- Create indexes for flashcard_reviews
create index flashcard_reviews_flashcard_id_idx on flashcard_reviews(flashcard_id);
create index flashcard_reviews_next_review_date_idx on flashcard_reviews(next_review_date);

-- Create study_sessions table
create table study_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    start_time timestamptz not null default now(),
    end_time timestamptz,
    cards_reviewed integer not null default 0,
    created_at timestamptz not null default now()
);

-- Create indexes for study_sessions
create index study_sessions_user_id_idx on study_sessions(user_id);
create index study_sessions_start_time_idx on study_sessions(start_time);

-- Create session_reviews table
create table session_reviews (
    id uuid primary key default gen_random_uuid(),
    study_session_id uuid not null references study_sessions(id) on delete cascade,
    flashcard_id uuid not null references flashcards(id) on delete cascade,
    flashcard_review_id uuid references flashcard_reviews(id) on delete set null,
    created_at timestamptz not null default now(),
    
    unique(study_session_id, flashcard_id)
);

-- Create indexes for session_reviews
create index session_reviews_study_session_id_idx on session_reviews(study_session_id);
create index session_reviews_flashcard_id_idx on session_reviews(flashcard_id);

-- Create system_logs table
create table system_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    error_code varchar(50) not null,
    error_message text not null,
    model varchar(100),
    created_at timestamptz not null default now()
);

-- Create indexes for system_logs
create index system_logs_user_id_idx on system_logs(user_id);
create index system_logs_error_code_idx on system_logs(error_code);
create index system_logs_created_at_idx on system_logs(created_at);

-- Enable Row Level Security
alter table flashcards enable row level security;
alter table flashcard_reviews enable row level security;
alter table study_sessions enable row level security;
alter table session_reviews enable row level security;
alter table system_logs enable row level security;

-- Create RLS policies for flashcards table
create policy "Users can view own flashcards"
    on flashcards for select
    using (auth.uid() = user_id);
    
create policy "Users can create own flashcards"
    on flashcards for insert
    with check (auth.uid() = user_id);
    
create policy "Users can update own flashcards"
    on flashcards for update
    using (auth.uid() = user_id);
    
create policy "Users can delete own flashcards"
    on flashcards for delete
    using (auth.uid() = user_id);

-- Create RLS policies for flashcard_reviews table
create policy "Users can view own flashcard reviews"
    on flashcard_reviews for select
    using (auth.uid() = (select user_id from flashcards where id = flashcard_id));
    
create policy "Users can create own flashcard reviews"
    on flashcard_reviews for insert
    with check (auth.uid() = (select user_id from flashcards where id = flashcard_id));
    
create policy "Users can update own flashcard reviews"
    on flashcard_reviews for update
    using (auth.uid() = (select user_id from flashcards where id = flashcard_id));
    
create policy "Users can delete own flashcard reviews"
    on flashcard_reviews for delete
    using (auth.uid() = (select user_id from flashcards where id = flashcard_id));

-- Create RLS policies for study_sessions table
create policy "Users can view own study sessions"
    on study_sessions for select
    using (auth.uid() = user_id);
    
create policy "Users can create own study sessions"
    on study_sessions for insert
    with check (auth.uid() = user_id);
    
create policy "Users can update own study sessions"
    on study_sessions for update
    using (auth.uid() = user_id);
    
create policy "Users can delete own study sessions"
    on study_sessions for delete
    using (auth.uid() = user_id);

-- Create RLS policies for session_reviews table
create policy "Users can view own session reviews"
    on session_reviews for select
    using (auth.uid() = (select user_id from study_sessions where id = study_session_id));
    
create policy "Users can create own session reviews"
    on session_reviews for insert
    with check (auth.uid() = (select user_id from study_sessions where id = study_session_id));
    
create policy "Users can update own session reviews"
    on session_reviews for update
    using (auth.uid() = (select user_id from study_sessions where id = study_session_id));
    
create policy "Users can delete own session reviews"
    on session_reviews for delete
    using (auth.uid() = (select user_id from study_sessions where id = study_session_id));

-- Create RLS policies for system_logs table
-- Only administrators have access to logs
create policy "Admins can view system logs"
    on system_logs for select
    using (auth.uid() in (
        select id from auth.users where email like '%@admin.com'
    )); 