-- Add payment_from column to payments table
alter table public.payments
add column payment_from text;

-- Add comment to document the column
comment on column public.payments.payment_from is 'Source or origin of the payment (e.g., Bank, Cash, Credit Card)';

