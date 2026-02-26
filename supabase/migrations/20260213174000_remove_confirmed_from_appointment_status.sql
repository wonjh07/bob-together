-- Remove `confirmed` from appointment_status enum.
-- Strategy:
-- 1) Drop dependent RPCs.
-- 2) Normalize existing data (`confirmed` -> `pending`).
-- 3) Swap enum type to two-state (`pending`, `canceled`).
-- 4) Recreate RPCs with updated enum dependency.

begin;

drop function if exists public.list_appointments_with_stats(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  integer
);

drop function if exists public.get_appointment_detail_with_count(
  uuid,
  uuid
);

update public.appointments
set status = 'pending'::public.appointment_status
where status = 'confirmed'::public.appointment_status;

alter table public.appointments
  alter column status drop default;

alter type public.appointment_status rename to appointment_status_old;

create type public.appointment_status as enum ('pending', 'canceled');

alter table public.appointments
  alter column status type public.appointment_status
  using (status::text::public.appointment_status);

alter table public.appointments
  alter column status set default 'pending'::public.appointment_status;

drop type public.appointment_status_old;

create function public.list_appointments_with_stats(
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
      p_cursor is null
      or a.start_at < p_cursor
    )
  order by a.start_at desc
  limit greatest(p_limit, 1) + 1;
$$;

revoke all on function public.list_appointments_with_stats(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  integer
) from public;

grant execute on function public.list_appointments_with_stats(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  integer
) to authenticated;

create function public.get_appointment_detail_with_count(
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
  join public.places p on p.place_id = a.place_id
  left join public.users u on u.user_id = a.creator_id
  left join lateral (
    select
      avg(up.score)::numeric as review_avg,
      count(up.score)::bigint as review_count
    from public.user_places up
    where up.place_id = a.place_id
      and up.score is not null
  ) pr on true
  where a.appointment_id = p_appointment_id
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
  limit 1;
$$;

revoke all on function public.get_appointment_detail_with_count(uuid, uuid) from public;
grant execute on function public.get_appointment_detail_with_count(uuid, uuid) to authenticated;

commit;
