-- Remove unused comment_count from appointment detail RPC payload.

drop function if exists public.get_appointment_detail_with_count(uuid, uuid);

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
