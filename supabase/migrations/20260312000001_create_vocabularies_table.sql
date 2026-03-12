-- Create vocabularies table
create table if not exists public.vocabularies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  german text not null,
  english text not null,
  vocabulary_category_id uuid references public.vocabulary_categories(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.vocabularies enable row level security;

-- Policy: Users can view their own vocabularies
create policy "Users can view their own vocabularies"
  on public.vocabularies
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Users can insert their own vocabularies
create policy "Users can insert their own vocabularies"
  on public.vocabularies
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy: Users can update their own vocabularies
create policy "Users can update their own vocabularies"
  on public.vocabularies
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own vocabularies
create policy "Users can delete their own vocabularies"
  on public.vocabularies
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index if not exists vocabularies_user_id_idx on public.vocabularies(user_id);
create index if not exists vocabularies_vocabulary_category_id_idx on public.vocabularies(vocabulary_category_id);

-- Create trigger to automatically update updated_at
create trigger set_vocabularies_updated_at
  before update on public.vocabularies
  for each row
  execute function public.handle_updated_at();
