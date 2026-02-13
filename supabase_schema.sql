-- PickAIHub: Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create the tools table
create table if not exists tools (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text not null default '',
  url            text not null,
  category       text not null default 'other',
  category_label text not null default 'Other',
  tags           text[] not null default '{}',
  pricing        text not null default 'free' check (pricing in ('free','paid','freemium')),
  pricing_label  text not null default 'Free',
  visits         text not null default '0',
  rating         real not null default 0,
  logo           text not null default '',
  is_new         boolean not null default true,
  is_trending    boolean not null default false,
  launch_date    date not null default current_date,
  created_at     timestamptz not null default now()
);

-- 2. Create indexes for common queries
create index if not exists idx_tools_category on tools(category);
create index if not exists idx_tools_is_trending on tools(is_trending);
create index if not exists idx_tools_launch_date on tools(launch_date desc);
create index if not exists idx_tools_name on tools using gin (name gin_trgm_ops);

-- 3. Enable Row-Level Security
alter table tools enable row level security;

-- 4. Public read-only policy (anyone can SELECT)
create policy "Public can read tools"
  on tools for select
  using (true);

-- No insert/update/delete policies for anon role.
-- The Python ingestion script uses the service_role key to bypass RLS.
