begin;

drop function if exists public.get_place_detail_with_stats(uuid);

create function public.get_place_detail_with_stats(p_place_id uuid)
returns table (
  place_id uuid,
  name text,
  address text,
  category text,
  latitude double precision,
  longitude double precision,
  review_avg numeric,
  review_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.place_id,
    p.name,
    p.address,
    p.category,
    p.latitude,
    p.longitude,
    rs.review_avg,
    rs.review_count
  from public.places p
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = p.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) rs on true
  where p.place_id = p_place_id
  limit 1;
$$;

revoke all on function public.get_place_detail_with_stats(uuid) from public;
grant execute on function public.get_place_detail_with_stats(uuid) to authenticated;

commit;
