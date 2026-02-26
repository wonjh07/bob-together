-- Allow group members to view invitation rows in their groups.
-- Needed for appointment invitation UI to show already-invited users.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitations'
      and policyname = 'invitations_select_group_member'
  ) then
    create policy "invitations_select_group_member"
    on public.invitations
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.group_members gm
        where gm.group_id = invitations.group_id
          and gm.user_id = auth.uid()
      )
    );
  end if;
end $$;

