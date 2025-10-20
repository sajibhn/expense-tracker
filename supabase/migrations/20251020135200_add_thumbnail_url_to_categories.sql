-- Add thumbnail_url column to categories table
alter table public.categories
add column thumbnail_url text;

-- Add comment to document the column
comment on column public.categories.thumbnail_url is 'URL for category thumbnail image';

