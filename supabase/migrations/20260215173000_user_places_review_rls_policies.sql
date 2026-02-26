-- Enable RLS and add review-safe policies for user_places.
-- Supports review create/update/delete by owner row, while keeping read access for rating aggregation.

alter table public.user_places enable row level security;
grant select, insert, update, delete on public.user_places to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_places'
      and policyname = 'user_places_select_authenticated'
  ) then
    create policy "user_places_select_authenticated"
    on public.user_places
    for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_places'
      and policyname = 'user_places_insert_self'
  ) then
    create policy "user_places_insert_self"
    on public.user_places
    for insert
    to authenticated
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_places'
      and policyname = 'user_places_update_self'
  ) then
    create policy "user_places_update_self"
    on public.user_places
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_places'
      and policyname = 'user_places_delete_self'
  ) then
    create policy "user_places_delete_self"
    on public.user_places
    for delete
    to authenticated
    using (user_id = auth.uid());
  end if;
end $$;
