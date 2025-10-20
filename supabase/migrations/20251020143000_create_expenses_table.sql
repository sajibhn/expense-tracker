-- Create expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(10, 2) not null,
  date date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.expenses enable row level security;

-- Create policies for authenticated users
-- Policy: Users can view their own expenses
create policy "Users can view their own expenses"
  on public.expenses
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Users can insert their own expenses
create policy "Users can insert their own expenses"
  on public.expenses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy: Users can update their own expenses
create policy "Users can update their own expenses"
  on public.expenses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own expenses
create policy "Users can delete their own expenses"
  on public.expenses
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index if not exists expenses_user_id_idx on public.expenses(user_id);
create index if not exists expenses_date_idx on public.expenses(date);
create index if not exists expenses_category_id_idx on public.expenses(category_id);

-- Create trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.expenses
  for each row
  execute function public.handle_updated_at();

