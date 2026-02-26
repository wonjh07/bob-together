begin;

drop function if exists public.list_place_reviews_with_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
);

create function public.list_place_reviews_with_cursor(
  p_place_id uuid,
  p_limit integer default 10,
  p_cursor_updated_at timestamptz default null,
  p_cursor_review_id uuid default null
)
returns table (
  review_id uuid,
  user_id uuid,
  score smallint,
  review text,
  edited_at timestamptz,
  updated_at timestamptz,
  user_name text,
  user_nickname text,
  user_profile_image text
)
language sql
security definer
set search_path = public
as $$
  select
    ur.review_id,
    ur.user_id,
    ur.score,
    ur.review,
    ur.edited_at,
    ur.updated_at,
    u.name as user_name,
    u.nickname as user_nickname,
    u.profile_image as user_profile_image
  from public.user_review ur
  join public.users u on u.user_id = ur.user_id
  where ur.place_id = p_place_id
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

revoke all on function public.list_place_reviews_with_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
) from public;
grant execute on function public.list_place_reviews_with_cursor(
  uuid,
  integer,
  timestamptz,
  uuid
) to authenticated;

commit;
