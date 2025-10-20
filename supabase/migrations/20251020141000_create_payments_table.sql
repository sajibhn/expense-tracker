-- Create payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(10, 2) not null,
  date date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.payments enable row level security;

-- Create policies for authenticated users
-- Policy: Users can view their own payments
create policy "Users can view their own payments"
  on public.payments
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Users can insert their own payments
create policy "Users can insert their own payments"
  on public.payments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy: Users can update their own payments
create policy "Users can update their own payments"
  on public.payments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own payments
create policy "Users can delete their own payments"
  on public.payments
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index on user_id for better query performance
create index if not exists payments_user_id_idx on public.payments(user_id);

-- Create index on date for better query performance
create index if not exists payments_date_idx on public.payments(date);

-- Create trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.payments
  for each row
  execute function public.handle_updated_at();

