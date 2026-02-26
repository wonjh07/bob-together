begin;

drop function if exists public.get_appointment_comments_with_cursor(
  uuid,
  uuid,
  integer,
  timestamptz,
  uuid,
  boolean
);

create function public.get_appointment_comments_with_cursor(
  p_user_id uuid,
  p_appointment_id uuid,
  p_limit integer default 20,
  p_cursor_created_at timestamptz default null,
  p_cursor_comment_id uuid default null,
  p_include_count boolean default true
)
returns table (
  ok boolean,
  error_code text,
  comment_count integer,
  comments jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_comment_count integer := 0;
  v_comments jsonb;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', 0, '[]'::jsonb;
    return;
  end if;

  if (p_cursor_created_at is null) <> (p_cursor_comment_id is null) then
    return query select false, 'invalid-format', 0, '[]'::jsonb;
    return;
  end if;

  if not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  v_limit := greatest(coalesce(p_limit, 20), 1);

  if coalesce(p_include_count, true) then
    select
      count(*)::integer
    into v_comment_count
    from public.appointment_comments ac
    where ac.appointment_id = p_appointment_id
      and ac.is_deleted = false
      and ac.deleted_at is null;
  end if;

  with rows as (
    select
      ac.comment_id,
      ac.content,
      ac.created_at,
      ac.user_id,
      u.name,
      u.nickname,
      u.profile_image
    from public.appointment_comments ac
    left join public.users u
      on u.user_id = ac.user_id
    where ac.appointment_id = p_appointment_id
      and ac.is_deleted = false
      and ac.deleted_at is null
      and (
        p_cursor_created_at is null
        or ac.created_at < p_cursor_created_at
        or (
          ac.created_at = p_cursor_created_at
          and ac.comment_id < p_cursor_comment_id
        )
      )
    order by ac.created_at desc, ac.comment_id desc
    limit v_limit + 1
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'comment_id', r.comment_id,
          'content', r.content,
          'created_at', r.created_at,
          'user_id', r.user_id,
          'name', r.name,
          'nickname', r.nickname,
          'profile_image', r.profile_image
        )
        order by r.created_at desc, r.comment_id desc
      ),
      '[]'::jsonb
    )
  into v_comments
  from rows r;

  return query select true, null::text, coalesce(v_comment_count, 0), v_comments;
exception
  when insufficient_privilege then
    return query select false, 'forbidden', 0, '[]'::jsonb;
  when others then
    return query select false, 'server-error', 0, '[]'::jsonb;
end;
$$;

revoke all on function public.get_appointment_comments_with_cursor(
  uuid,
  uuid,
  integer,
  timestamptz,
  uuid,
  boolean
) from public;
grant execute on function public.get_appointment_comments_with_cursor(
  uuid,
  uuid,
  integer,
  timestamptz,
  uuid,
  boolean
) to authenticated;

commit;
