begin;

drop function if exists public.delete_my_review_transactional(
  uuid,
  uuid,
  timestamptz
);

create function public.delete_my_review_transactional(
  p_user_id uuid,
  p_appointment_id uuid,
  p_edited_at timestamptz default null
)
returns table (
  ok boolean,
  error_code text,
  appointment_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review public.user_review%rowtype;
  v_edited_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  v_edited_at := coalesce(p_edited_at, now());

  begin
    select *
    into v_review
    from public.user_review ur
    where ur.user_id = p_user_id
      and ur.appointment_id = p_appointment_id
    limit 1
    for update;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error-read', null::uuid;
      return;
  end;

  if not found
    or (
      v_review.score is null
      and (
        v_review.review is null
        or btrim(v_review.review) = ''
      )
    ) then
    return query select true, null::text, p_appointment_id;
    return;
  end if;

  begin
    update public.user_review ur
    set
      score = null,
      review = null,
      edited_at = v_edited_at
    where ur.review_id = v_review.review_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error-update', null::uuid;
      return;
  end;

  return query select true, null::text, p_appointment_id;
end;
$$;

revoke all on function public.delete_my_review_transactional(
  uuid,
  uuid,
  timestamptz
) from public;
grant execute on function public.delete_my_review_transactional(
  uuid,
  uuid,
  timestamptz
) to authenticated;

commit;
