-- Group manage page support:
-- 1) list_my_groups_with_stats RPC (security definer)
-- 2) allow authenticated users to leave their own membership rows.

drop function if exists public.list_my_groups_with_stats(uuid, integer, timestamptz, uuid);

create function public.list_my_groups_with_stats(
  p_user_id uuid,
  p_limit integer default 10,
  p_cursor_joined_at timestamptz default null,
  p_cursor_group_id uuid default null
)
returns table (
  group_id uuid,
  group_name text,
  owner_name text,
  owner_nickname text,
  owner_profile_image text,
  joined_at timestamptz,
  created_at timestamptz,
  member_count bigint,
  is_owner boolean
)
language sql
security definer
set search_path = public
as $$
  select
    g.group_id,
    g.name as group_name,
    u.name as owner_name,
    u.nickname as owner_nickname,
    u.profile_image as owner_profile_image,
    gm.joined_at,
    g.created_at,
    (
      select count(*)::bigint
      from public.group_members gm_count
      where gm_count.group_id = g.group_id
    ) as member_count,
    (gm.role = 'owner'::public.group_member_role) as is_owner
  from public.group_members gm
  join public.groups g on g.group_id = gm.group_id
  left join public.users u on u.user_id = g.owner_id
  where gm.user_id = p_user_id
    and (
      p_cursor_joined_at is null
      or gm.joined_at < p_cursor_joined_at
      or (gm.joined_at = p_cursor_joined_at and gm.group_id < p_cursor_group_id)
    )
  order by gm.joined_at desc, gm.group_id desc
  limit greatest(p_limit, 1) + 1;
$$;

revoke all on function public.list_my_groups_with_stats(uuid, integer, timestamptz, uuid) from public;
grant execute on function public.list_my_groups_with_stats(uuid, integer, timestamptz, uuid) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'group_members'
      and policyname = 'group_members_delete_self'
  ) then
    create policy "group_members_delete_self"
    on public.group_members
    for delete
    to authenticated
    using (
      user_id = auth.uid()
      and role <> 'owner'::public.group_member_role
    );
  end if;
end $$;
