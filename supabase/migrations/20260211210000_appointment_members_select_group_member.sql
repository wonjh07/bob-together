-- Allow group members to view all appointment members for appointments in their groups.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_members'
      and policyname = 'appointment_members_select_group_member'
  ) then
    create policy "appointment_members_select_group_member"
    on public.appointment_members
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.appointments a
        join public.group_members gm on gm.group_id = a.group_id
        where a.appointment_id = appointment_members.appointment_id
          and gm.user_id = auth.uid()
      )
    );
  end if;
end $$;
