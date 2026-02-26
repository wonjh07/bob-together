begin;

drop function if exists public.list_appointment_history_with_stats_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
);

create function public.list_appointment_history_with_stats_cursor(
  p_user_id uuid,
  p_limit integer default 10,
  p_cursor_ends_at timestamptz default null,
  p_cursor_appointment_id uuid default null
)
returns table (
  appointment_id uuid,
  title text,
  start_at timestamptz,
  ends_at timestamptz,
  creator_id uuid,
  creator_name text,
  creator_nickname text,
  creator_profile_image text,
  place_id uuid,
  place_name text,
  place_address text,
  place_category text,
  member_count bigint,
  review_avg numeric,
  review_count bigint,
  can_write_review boolean
)
language sql
security definer
set search_path = public
as $$
  with history as (
    select
      a.appointment_id,
      a.title,
      a.start_at,
      a.ends_at,
      a.creator_id,
      a.place_id
    from public.appointments a
    where p_user_id = auth.uid()
      and a.status <> 'canceled'
      and a.ends_at <= now()
      and exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
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
    limit greatest(coalesce(p_limit, 10), 1) + 1
  )
  select
    h.appointment_id,
    h.title,
    h.start_at,
    h.ends_at,
    h.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    u.profile_image as creator_profile_image,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = h.appointment_id
    ) as member_count,
    pr.review_avg,
    pr.review_count,
    not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = h.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    ) as can_write_review
  from history h
  join public.places p
    on p.place_id = h.place_id
  left join public.users u
    on u.user_id = h.creator_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = h.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  order by h.ends_at desc, h.appointment_id desc;
$$;

revoke all on function public.list_appointment_history_with_stats_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
) from public;
grant execute on function public.list_appointment_history_with_stats_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
) to authenticated;

commit;
