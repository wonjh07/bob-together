-- Search RPC functions with accurate member counts.
-- Uses security definer to return bounded, filtered data safely.

create or replace function public.search_groups_with_count(
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

create or replace function public.search_appointments_with_count(
  p_user_id uuid,
  p_query text,
  p_limit integer default 10,
  p_cursor_start_at timestamptz default null,
  p_cursor_appointment_id uuid default null
)
returns table (
  appointment_id uuid,
  title text,
  start_at timestamptz,
  ends_at timestamptz,
  host_name text,
  host_nickname text,
  member_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    a.appointment_id,
    a.title,
    a.start_at,
    a.ends_at,
    u.name as host_name,
    u.nickname as host_nickname,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count
  from public.appointments a
  left join public.users u on u.user_id = a.creator_id
  where a.title ilike '%' || p_query || '%'
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
    and (
      p_cursor_start_at is null
      or a.start_at < p_cursor_start_at
      or (
        a.start_at = p_cursor_start_at
        and a.appointment_id < p_cursor_appointment_id
      )
    )
  order by a.start_at desc, a.appointment_id desc
  limit greatest(p_limit, 1) + 1;
$$;

revoke all on function public.search_groups_with_count(uuid, text, integer, text, uuid) from public;
revoke all on function public.search_appointments_with_count(uuid, text, integer, timestamptz, uuid) from public;

grant execute on function public.search_groups_with_count(uuid, text, integer, text, uuid) to authenticated;
grant execute on function public.search_appointments_with_count(uuid, text, integer, timestamptz, uuid) to authenticated;
