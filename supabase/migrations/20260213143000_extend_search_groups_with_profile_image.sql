-- Extend group search RPC to return owner profile image for UI cards.

drop function if exists public.search_groups_with_count(uuid, text, integer, text, uuid);

create function public.search_groups_with_count(
  p_user_id uuid,
  p_query text,
  p_limit integer default 10,
  p_cursor_name text default null,
  p_cursor_group_id uuid default null
)
returns table (
  group_id uuid,
  group_name text,
  owner_name text,
  owner_nickname text,
  owner_profile_image text,
  member_count bigint,
  is_member boolean
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
    (
      select count(*)::bigint
      from public.group_members gm_count
      where gm_count.group_id = g.group_id
    ) as member_count,
    exists (
      select 1
      from public.group_members gm_me
      where gm_me.group_id = g.group_id
        and gm_me.user_id = p_user_id
    ) as is_member
  from public.groups g
  left join public.users u on u.user_id = g.owner_id
  where g.name ilike '%' || p_query || '%'
    and (
      p_cursor_name is null
      or g.name > p_cursor_name
      or (g.name = p_cursor_name and g.group_id > p_cursor_group_id)
    )
  order by g.name asc, g.group_id asc
  limit greatest(p_limit, 1) + 1;
$$;

revoke all on function public.search_groups_with_count(uuid, text, integer, text, uuid) from public;
grant execute on function public.search_groups_with_count(uuid, text, integer, text, uuid) to authenticated;
