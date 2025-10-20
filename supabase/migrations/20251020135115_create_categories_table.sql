-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.categories enable row level security;

-- Create policies for authenticated users
-- Policy: Users can view their own categories
create policy "Users can view their own categories"
  on public.categories
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Users can insert their own categories
create policy "Users can insert their own categories"
  on public.categories
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy: Users can update their own categories
create policy "Users can update their own categories"
  on public.categories
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own categories
create policy "Users can delete their own categories"
  on public.categories
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index on user_id for better query performance
create index if not exists categories_user_id_idx on public.categories(user_id);

-- Create updated_at trigger function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.categories
  for each row
  execute function public.handle_updated_at();

