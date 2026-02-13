-- Create the favorites table
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tool_id uuid references public.tools(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, tool_id)
);

-- Enable RLS
alter table favorites enable row level security;

-- Policies
create policy "Users can view own favorites" 
  on favorites for select 
  using (auth.uid() = user_id);

create policy "Users can add favorites" 
  on favorites for insert 
  with check (auth.uid() = user_id);

create policy "Users can remove favorites" 
  on favorites for delete 
  using (auth.uid() = user_id);
