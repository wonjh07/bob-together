begin;

drop function if exists public.list_my_reviews_with_cursor(
  integer,
  timestamptz,
  uuid
);

create function public.list_my_reviews_with_cursor(
  p_limit integer default 10,
  p_cursor_updated_at timestamptz default null,
  p_cursor_review_id uuid default null
)
returns table (
  review_id uuid,
  appointment_id uuid,
  place_id uuid,
  score smallint,
  review text,
  edited_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  place_name text
)
language sql
security definer
set search_path = public
as $$
  select
    ur.review_id,
    ur.appointment_id,
    ur.place_id,
    ur.score,
    ur.review,
    ur.edited_at,
    ur.created_at,
    ur.updated_at,
    p.name as place_name
  from public.user_review ur
  left join public.places p on p.place_id = ur.place_id
  where ur.user_id = auth.uid()
    and ur.appointment_id is not null
    and (ur.score is not null or ur.review is not null)
    and (
      p_cursor_updated_at is null
      or (
        ur.updated_at,
        ur.review_id
      ) < (
        p_cursor_updated_at,
        p_cursor_review_id
      )
    )
  order by ur.updated_at desc, ur.review_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;

revoke all on function public.list_my_reviews_with_cursor(
  integer,
  timestamptz,
  uuid
) from public;
grant execute on function public.list_my_reviews_with_cursor(
  integer,
  timestamptz,
  uuid
) to authenticated;

commit;
