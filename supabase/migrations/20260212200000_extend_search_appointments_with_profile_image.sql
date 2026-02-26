-- Extend appointment search RPC to include host profile image.
-- Return type change requires drop + recreate.

drop function if exists public.search_appointments_with_count(
  uuid,
  text,
  integer,
  timestamptz,
  uuid
);

create function public.search_appointments_with_count(
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
  host_profile_image text,
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
    u.profile_image as host_profile_image,
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

revoke all on function public.search_appointments_with_count(
  uuid,
  text,
  integer,
  timestamptz,
  uuid
) from public;

grant execute on function public.search_appointments_with_count(
  uuid,
  text,
  integer,
  timestamptz,
  uuid
) to authenticated;
