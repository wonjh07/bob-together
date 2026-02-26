-- Allow invitee to read and respond to own invitations.
-- Used by dashboard notifications (accept/reject invitation flow).

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitations'
      and policyname = 'invitations_select_invitee_self'
  ) then
    create policy "invitations_select_invitee_self"
    on public.invitations
    for select
    to authenticated
    using (invitee_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitations'
      and policyname = 'invitations_update_invitee_self'
  ) then
    create policy "invitations_update_invitee_self"
    on public.invitations
    for update
    to authenticated
    using (invitee_id = auth.uid())
    with check (invitee_id = auth.uid());
  end if;
end $$;
