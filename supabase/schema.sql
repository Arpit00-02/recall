-- Run this once in Supabase SQL editor

create table if not exists meetings (
  id uuid primary key default uuid_generate_v4(),
  title text,
  duration_seconds int,
  summary text,
  action_items jsonb default '[]',
  topics jsonb default '[]',
  raw_transcript text not null,
  created_at timestamp default now()
);

create table if not exists chunks (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid references meetings(id) on delete cascade,
  speaker text,
  text text,
  start_seconds float,
  end_seconds float
);

-- Enable full-text search
alter table meetings add column if not exists search_vector tsvector 
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || raw_transcript)) stored;

create index if not exists idx_fts on meetings using gin(search_vector);

-- Index for chunks search
create index if not exists idx_chunks_meeting_id on chunks(meeting_id);
create index if not exists idx_chunks_start_seconds on chunks(start_seconds);

