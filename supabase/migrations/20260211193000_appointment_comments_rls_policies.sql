-- Enable RLS and add policies for appointment_comments.
-- Guarded with pg_policies checks to support re-runs safely.

alter table public.appointment_comments enable row level security;
grant select, insert, update, delete on public.appointment_comments to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_comments'
      and policyname = 'appointment_comments_select_group_member'
  ) then
    create policy "appointment_comments_select_group_member"
    on public.appointment_comments
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.appointments a
        join public.group_members gm on gm.group_id = a.group_id
        where a.appointment_id = appointment_comments.appointment_id
          and gm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_comments'
      and policyname = 'appointment_comments_insert_group_member_self'
  ) then
    create policy "appointment_comments_insert_group_member_self"
    on public.appointment_comments
    for insert
    to authenticated
    with check (
      user_id = auth.uid()
      and exists (
        select 1
        from public.appointments a
        join public.group_members gm on gm.group_id = a.group_id
        where a.appointment_id = appointment_comments.appointment_id
          and gm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_comments'
      and policyname = 'appointment_comments_update_self'
  ) then
    create policy "appointment_comments_update_self"
    on public.appointment_comments
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_comments'
      and policyname = 'appointment_comments_delete_self'
  ) then
    create policy "appointment_comments_delete_self"
    on public.appointment_comments
    for delete
    to authenticated
    using (user_id = auth.uid());
  end if;
end $$;
