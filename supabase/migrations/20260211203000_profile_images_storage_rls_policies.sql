-- Allow authenticated users to manage only their own profile image objects.
-- Object key format is expected as: {auth.uid()}/avatar-*.jpg

grant select, insert, update, delete on storage.objects to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_images_select_own'
  ) then
    create policy "profile_images_select_own"
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'profile-images'
      and split_part(name, '/', 1) = auth.uid()::text
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_images_insert_own'
  ) then
    create policy "profile_images_insert_own"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'profile-images'
      and split_part(name, '/', 1) = auth.uid()::text
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_images_update_own'
  ) then
    create policy "profile_images_update_own"
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'profile-images'
      and split_part(name, '/', 1) = auth.uid()::text
    )
    with check (
      bucket_id = 'profile-images'
      and split_part(name, '/', 1) = auth.uid()::text
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_images_delete_own'
  ) then
    create policy "profile_images_delete_own"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'profile-images'
      and split_part(name, '/', 1) = auth.uid()::text
    );
  end if;
end $$;
