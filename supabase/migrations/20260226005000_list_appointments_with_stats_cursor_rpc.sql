begin;

drop function if exists public.list_appointments_with_stats_cursor(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid,
  integer
);

create function public.list_appointments_with_stats_cursor(
  p_user_id uuid,
  p_group_id uuid,
  p_period text default 'all',
  p_type text default 'all',
  p_cursor_start_at timestamptz default null,
  p_cursor_appointment_id uuid default null,
  p_limit integer default 10
)
returns table (
  appointment_id uuid,
  title text,
  status public.appointment_status,
  start_at timestamptz,
  ends_at timestamptz,
  creator_id uuid,
  creator_name text,
  creator_nickname text,
  place_id uuid,
  place_name text,
  place_address text,
  place_category text,
  member_count bigint,
  comment_count bigint,
  is_owner boolean,
  is_member boolean
)
language sql
security definer
set search_path = public
as $$
  select
    a.appointment_id,
    a.title,
    a.status,
    a.start_at,
    a.ends_at,
    a.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count,
    (
      select count(*)::bigint
      from public.appointment_comments ac_count
      where ac_count.appointment_id = a.appointment_id
        and ac_count.is_deleted = false
        and ac_count.deleted_at is null
    ) as comment_count,
    (a.creator_id = p_user_id) as is_owner,
    exists (
      select 1
      from public.appointment_members am_me
      where am_me.appointment_id = a.appointment_id
        and am_me.user_id = p_user_id
    ) as is_member
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join public.users u
    on u.user_id = a.creator_id
  where a.group_id = p_group_id
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
    and (
      p_period = 'all'
      or (p_period = 'today' and a.start_at >= date_trunc('day', now()))
      or (p_period = 'week' and a.start_at >= now() - interval '7 days')
      or (p_period = 'month' and a.start_at >= now() - interval '1 month')
    )
    and (
      p_type = 'all'
      or (p_type = 'created' and a.creator_id = p_user_id)
      or (
        p_type = 'joined'
        and a.creator_id <> p_user_id
        and exists (
          select 1
          from public.appointment_members am_joined
          where am_joined.appointment_id = a.appointment_id
            and am_joined.user_id = p_user_id
        )
      )
    )
    and (
      p_cursor_start_at is null
      or (
        a.start_at,
        a.appointment_id
      ) < (
        p_cursor_start_at,
        p_cursor_appointment_id
      )
    )
  order by a.start_at desc, a.appointment_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;

revoke all on function public.list_appointments_with_stats_cursor(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid,
  integer
) from public;
grant execute on function public.list_appointments_with_stats_cursor(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid,
  integer
) to authenticated;

commit;
