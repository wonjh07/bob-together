begin;

drop function if exists public.list_my_comments_with_cursor(
  integer,
  timestamptz,
  uuid
);

create function public.list_my_comments_with_cursor(
  p_limit integer default 10,
  p_cursor_created_at timestamptz default null,
  p_cursor_comment_id uuid default null
)
returns table (
  comment_id uuid,
  appointment_id uuid,
  content text,
  created_at timestamptz,
  appointment_title text
)
language sql
security definer
set search_path = public
as $$
  select
    c.comment_id,
    c.appointment_id,
    c.content,
    c.created_at,
    a.title as appointment_title
  from public.appointment_comments c
  join public.appointments a on a.appointment_id = c.appointment_id
  where c.user_id = auth.uid()
    and c.is_deleted = false
    and c.deleted_at is null
    and (
      p_cursor_created_at is null
      or (
        c.created_at,
        c.comment_id
      ) < (
        p_cursor_created_at,
        p_cursor_comment_id
      )
    )
  order by c.created_at desc, c.comment_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;

revoke all on function public.list_my_comments_with_cursor(
  integer,
  timestamptz,
  uuid
) from public;
grant execute on function public.list_my_comments_with_cursor(
  integer,
  timestamptz,
  uuid
) to authenticated;

commit;
