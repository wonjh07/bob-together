-- Enable RLS and add policies for appointments, appointment members, and places.
-- Uses guards to avoid errors if policies already exist.

alter table public.places enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_members enable row level security;

grant select, insert, update, delete on public.places to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.appointment_members to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'places'
      and policyname = 'places_select_authenticated'
  ) then
    create policy "places_select_authenticated"
    on public.places
    for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'places'
      and policyname = 'places_insert_authenticated'
  ) then
    create policy "places_insert_authenticated"
    on public.places
    for insert
    to authenticated
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'places'
      and policyname = 'places_update_authenticated'
  ) then
    create policy "places_update_authenticated"
    on public.places
    for update
    to authenticated
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'places'
      and policyname = 'places_delete_authenticated'
  ) then
    create policy "places_delete_authenticated"
    on public.places
    for delete
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and policyname = 'appointments_select_group_member'
  ) then
    create policy "appointments_select_group_member"
    on public.appointments
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.group_members gm
        where gm.group_id = appointments.group_id
          and gm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and policyname = 'appointments_insert_group_member'
  ) then
    create policy "appointments_insert_group_member"
    on public.appointments
    for insert
    to authenticated
    with check (
      creator_id = auth.uid()
      and exists (
        select 1
        from public.group_members gm
        where gm.group_id = appointments.group_id
          and gm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and policyname = 'appointments_update_creator'
  ) then
    create policy "appointments_update_creator"
    on public.appointments
    for update
    to authenticated
    using (creator_id = auth.uid())
    with check (creator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and policyname = 'appointments_delete_creator'
  ) then
    create policy "appointments_delete_creator"
    on public.appointments
    for delete
    to authenticated
    using (creator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_members'
      and policyname = 'appointment_members_select_self'
  ) then
    create policy "appointment_members_select_self"
    on public.appointment_members
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_members'
      and policyname = 'appointment_members_insert_self'
  ) then
    create policy "appointment_members_insert_self"
    on public.appointment_members
    for insert
    to authenticated
    with check (
      user_id = auth.uid()
      and exists (
        select 1
        from public.appointments a
        join public.group_members gm on gm.group_id = a.group_id
        where a.appointment_id = appointment_members.appointment_id
          and gm.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_members'
      and policyname = 'appointment_members_update_self'
  ) then
    create policy "appointment_members_update_self"
    on public.appointment_members
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_members'
      and policyname = 'appointment_members_delete_self'
  ) then
    create policy "appointment_members_delete_self"
    on public.appointment_members
    for delete
    to authenticated
    using (user_id = auth.uid());
  end if;
end $$;
