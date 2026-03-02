begin;

-- P0 hardening:
-- 1) enforce caller/user context inside SECURITY DEFINER read RPCs
-- 2) revoke anon execution from user-scoped RPCs

create or replace function public.get_appointment_detail_with_count(
  p_user_id uuid,
  p_appointment_id uuid
)
returns table (
  appointment_id uuid,
  title text,
  status public.appointment_status,
  start_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz,
  creator_id uuid,
  creator_name text,
  creator_nickname text,
  creator_profile_image text,
  place_id uuid,
  place_name text,
  place_address text,
  place_category text,
  place_latitude double precision,
  place_longitude double precision,
  member_count bigint,
  is_member boolean,
  review_avg numeric,
  review_count bigint
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
    a.created_at,
    a.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    u.profile_image as creator_profile_image,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    p.latitude as place_latitude,
    p.longitude as place_longitude,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count,
    exists (
      select 1
      from public.appointment_members am_me
      where am_me.appointment_id = a.appointment_id
        and am_me.user_id = p_user_id
    ) as is_member,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join public.users u
    on u.user_id = a.creator_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where p_user_id = auth.uid()
    and a.appointment_id = p_appointment_id
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
  limit 1;
$$;

create or replace function public.list_appointments_with_stats(
  p_user_id uuid,
  p_group_id uuid,
  p_period text default 'all',
  p_type text default 'all',
  p_cursor timestamptz default null,
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
  where p_user_id = auth.uid()
    and a.group_id = p_group_id
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
      p_cursor is null
      or a.start_at < p_cursor
    )
  order by a.start_at desc
  limit greatest(p_limit, 1) + 1;
$$;

create or replace function public.list_appointments_with_stats_cursor(
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
  where p_user_id = auth.uid()
    and a.group_id = p_group_id
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

create or replace function public.list_my_groups_with_stats(
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
  where p_user_id = auth.uid()
    and gm.user_id = p_user_id
    and (
      p_cursor_joined_at is null
      or gm.joined_at < p_cursor_joined_at
      or (gm.joined_at = p_cursor_joined_at and gm.group_id < p_cursor_group_id)
    )
  order by gm.joined_at desc, gm.group_id desc
  limit greatest(p_limit, 1) + 1;
$$;

create or replace function public.list_reviewable_appointments_with_stats(
  p_user_id uuid,
  p_offset integer default 0,
  p_limit integer default 6
)
returns table (
  appointment_id uuid,
  title text,
  start_at timestamptz,
  ends_at timestamptz,
  place_id uuid,
  place_name text,
  review_avg numeric,
  review_count bigint
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
    p.place_id,
    p.name as place_name,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where p_user_id = auth.uid()
    and a.status <> 'canceled'
    and a.ends_at <= now()
    and (
      a.creator_id = p_user_id
      or exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
      )
    )
    and not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = a.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    )
  order by a.ends_at desc, a.appointment_id desc
  offset greatest(p_offset, 0)
  limit greatest(p_limit, 1) + 1;
$$;

create or replace function public.list_reviewable_appointments_with_stats_cursor(
  p_user_id uuid,
  p_limit integer default 6,
  p_cursor_ends_at timestamptz default null,
  p_cursor_appointment_id uuid default null
)
returns table (
  appointment_id uuid,
  title text,
  start_at timestamptz,
  ends_at timestamptz,
  place_id uuid,
  place_name text,
  review_avg numeric,
  review_count bigint
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
    p.place_id,
    p.name as place_name,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where p_user_id = auth.uid()
    and a.status <> 'canceled'
    and a.ends_at <= now()
    and (
      a.creator_id = p_user_id
      or exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
      )
    )
    and not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = a.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    )
    and (
      p_cursor_ends_at is null
      or (
        a.ends_at,
        a.appointment_id
      ) < (
        p_cursor_ends_at,
        p_cursor_appointment_id
      )
    )
  order by a.ends_at desc, a.appointment_id desc
  limit greatest(coalesce(p_limit, 6), 1) + 1;
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
  where p_user_id = auth.uid()
    and a.title ilike '%' || p_query || '%'
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
  where p_user_id = auth.uid()
    and g.name ilike '%' || p_query || '%'
    and (
      p_cursor_name is null
      or g.name > p_cursor_name
      or (g.name = p_cursor_name and g.group_id > p_cursor_group_id)
    )
  order by g.name asc, g.group_id asc
  limit greatest(p_limit, 1) + 1;
$$;

revoke all on function public.get_appointment_detail_with_count(uuid, uuid) from anon;
revoke all on function public.list_appointments_with_stats(uuid, uuid, text, text, timestamptz, integer) from anon;
revoke all on function public.list_appointments_with_stats_cursor(uuid, uuid, text, text, timestamptz, uuid, integer) from anon;
revoke all on function public.list_my_groups_with_stats(uuid, integer, timestamptz, uuid) from anon;
revoke all on function public.list_reviewable_appointments_with_stats(uuid, integer, integer) from anon;
revoke all on function public.list_reviewable_appointments_with_stats_cursor(uuid, integer, timestamptz, uuid) from anon;
revoke all on function public.search_appointments_with_count(uuid, text, integer, timestamptz, uuid) from anon;
revoke all on function public.search_groups_with_count(uuid, text, integer, text, uuid) from anon;

grant execute on function public.get_appointment_detail_with_count(uuid, uuid) to authenticated, service_role;
grant execute on function public.list_appointments_with_stats(uuid, uuid, text, text, timestamptz, integer) to authenticated, service_role;
grant execute on function public.list_appointments_with_stats_cursor(uuid, uuid, text, text, timestamptz, uuid, integer) to authenticated, service_role;
grant execute on function public.list_my_groups_with_stats(uuid, integer, timestamptz, uuid) to authenticated, service_role;
grant execute on function public.list_reviewable_appointments_with_stats(uuid, integer, integer) to authenticated, service_role;
grant execute on function public.list_reviewable_appointments_with_stats_cursor(uuid, integer, timestamptz, uuid) to authenticated, service_role;
grant execute on function public.search_appointments_with_count(uuid, text, integer, timestamptz, uuid) to authenticated, service_role;
grant execute on function public.search_groups_with_count(uuid, text, integer, text, uuid) to authenticated, service_role;

commit;
