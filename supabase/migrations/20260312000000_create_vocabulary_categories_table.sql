-- Create vocabulary_categories table
create table if not exists public.vocabulary_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, name)
);

-- Enable Row Level Security
alter table public.vocabulary_categories enable row level security;

-- Policy: Users can view their own vocabulary categories
create policy "Users can view their own vocabulary categories"
  on public.vocabulary_categories
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Users can insert their own vocabulary categories
create policy "Users can insert their own vocabulary categories"
  on public.vocabulary_categories
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy: Users can update their own vocabulary categories
create policy "Users can update their own vocabulary categories"
  on public.vocabulary_categories
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own vocabulary categories
create policy "Users can delete their own vocabulary categories"
  on public.vocabulary_categories
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index on user_id for better query performance
create index if not exists vocabulary_categories_user_id_idx on public.vocabulary_categories(user_id);

-- Create trigger to automatically update updated_at
create trigger set_vocabulary_categories_updated_at
  before update on public.vocabulary_categories
  for each row
  execute function public.handle_updated_at();
