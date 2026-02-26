begin;

drop function if exists public.list_reviewable_appointments_with_stats_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
);

create function public.list_reviewable_appointments_with_stats_cursor(
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
  where a.status <> 'canceled'
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

revoke all on function public.list_reviewable_appointments_with_stats_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
) from public;
grant execute on function public.list_reviewable_appointments_with_stats_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
) to authenticated;

commit;
