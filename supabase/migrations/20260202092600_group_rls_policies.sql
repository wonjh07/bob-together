-- Enable RLS and add minimal policies for group onboarding flow.
-- Uses guards to avoid errors if policies already exist.

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.invitations enable row level security;
alter table public.users enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.invitations to authenticated;
grant select on public.users to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'groups'
      and policyname = 'groups_select_authenticated'
  ) then
    create policy "groups_select_authenticated"
    on public.groups
    for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'groups'
      and policyname = 'groups_insert_owner'
  ) then
    create policy "groups_insert_owner"
    on public.groups
    for insert
    to authenticated
    with check (owner_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'group_members'
      and policyname = 'group_members_select_self'
  ) then
    create policy "group_members_select_self"
    on public.group_members
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'group_members'
      and policyname = 'group_members_insert_self_or_owner'
  ) then
    create policy "group_members_insert_self_or_owner"
    on public.group_members
    for insert
    to authenticated
    with check (
      user_id = auth.uid()
      or exists (
        select 1
        from public.groups g
        where g.group_id = group_members.group_id
          and g.owner_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users_select_authenticated'
  ) then
    create policy "users_select_authenticated"
    on public.users
    for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invitations'
      and policyname = 'invitations_insert_group_member'
  ) then
    create policy "invitations_insert_group_member"
    on public.invitations
    for insert
    to authenticated
    with check (
      inviter_id = auth.uid()
      and exists (
        select 1
        from public.group_members gm
        where gm.group_id = invitations.group_id
          and gm.user_id = auth.uid()
      )
    );
  end if;
end $$;
