-- Create subscribers table
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table subscribers enable row level security;

-- Create policy to allow public to insert (subscribe)
-- We allow insert, but select/update/delete should be restricted to service role or admin
create policy "Allow public insert to subscribers"
  on subscribers for insert
  with check (true);

-- Create policy to allow service role full access (default behavior, but explicit is good)
-- Note: Service role bypasses RLS anyway, but this is for completeness if we add admin users later
create policy "Allow service role full access"
  on subscribers
  using (auth.role() = 'service_role');
