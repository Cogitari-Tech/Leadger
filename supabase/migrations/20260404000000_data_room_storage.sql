-- Criando bucket do Data Room
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('data_room', 'data_room', false, 52428800, '{ "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg" }')
on conflict (id) do update set 
  public = false, 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: Apenas usuários autenticados da organização podem ler/inserir (baseado em metadata ou role)
-- Assumindo que o tenant envia o org_id no JWT app_metadata ou similar na request
create policy "Select acess restricted to tenant" 
on storage.objects for select 
to authenticated 
using (
  bucket_id = 'data_room' and
  auth.uid() in (
    select user_id from public.cap_table_shareholders 
    where email = auth.jwt()->>'email'
  )
);

create policy "Insert access restricted to admins" 
on storage.objects for insert 
to authenticated 
with check (
  bucket_id = 'data_room' and
  auth.jwt()->>'role' in ('admin', 'owner')
);

create policy "Delete access restricted to owner" 
on storage.objects for delete 
to authenticated 
using (
  bucket_id = 'data_room' and
  auth.jwt()->>'role' = 'owner'
);
