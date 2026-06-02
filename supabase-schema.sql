-- Run this in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → your project → SQL Editor → New query

create table if not exists interview_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'anonymous',
  mode text not null,
  airline text not null,
  difficulty text not null,
  overall_score integer not null,
  selection_probability integer not null,
  readiness_level text not null,
  scores_breakdown jsonb not null default '{}',
  recruiter_note text not null default '',
  questions_answered integer not null default 0,
  created_at timestamptz default now()
);

-- Index for fast user lookups
create index if not exists idx_sessions_user_id on interview_sessions(user_id);
create index if not exists idx_sessions_created_at on interview_sessions(created_at desc);

-- Row Level Security (optional but recommended)
alter table interview_sessions enable row level security;

-- Allow all operations for now (tighten after adding auth)
create policy "Allow all for anonymous users"
  on interview_sessions
  for all
  using (true)
  with check (true);
