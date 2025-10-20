-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('expense_tracker', 'expense_tracker', true)
on conflict (id) do update set public = true;

-- Allow authenticated users to upload files
create policy "Allow authenticated users to upload files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'expense_tracker');

-- Allow authenticated users to update their own files
create policy "Allow authenticated users to update files"
on storage.objects
for update
to authenticated
using (bucket_id = 'expense_tracker');

-- Allow authenticated users to delete their own files
create policy "Allow authenticated users to delete files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'expense_tracker');

-- Allow public read access to all files (for image display)
create policy "Allow public read access"
on storage.objects
for select
to public
using (bucket_id = 'expense_tracker');

