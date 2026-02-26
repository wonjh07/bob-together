-- Allow authenticated users to update only their own users row.

grant update on public.users to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users_update_self'
  ) then
    create policy "users_update_self"
    on public.users
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end $$;
