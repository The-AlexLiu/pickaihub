-- submissions table for user-submitted AI tools
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  url text not null,
  description text not null,
  category text not null default 'other',
  pricing text not null default 'free',
  tags text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_email text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table submissions enable row level security;

-- Policies
-- Users can view their own submissions
create policy "Users can view own submissions"
  on submissions for select
  using (auth.uid() = user_id);

-- Users can insert submissions
create policy "Users can create submissions"
  on submissions for insert
  with check (auth.uid() = user_id);

-- Index for admin review queries
create index idx_submissions_status on submissions(status);
create index idx_submissions_user on submissions(user_id);
