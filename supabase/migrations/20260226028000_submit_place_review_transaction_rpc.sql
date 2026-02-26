begin;

drop function if exists public.submit_place_review_transactional(
  uuid,
  uuid,
  integer,
  text,
  timestamptz
);

create function public.submit_place_review_transactional(
  p_user_id uuid,
  p_appointment_id uuid,
  p_score integer,
  p_content text,
  p_edited_at timestamptz default null
)
returns table (
  ok boolean,
  error_code text,
  appointment_id uuid,
  place_id uuid,
  mode text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment public.appointments%rowtype;
  v_review public.user_review%rowtype;
  v_mode text;
  v_edited_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid, null::uuid, null::text;
    return;
  end if;

  if p_user_id is null
    or p_appointment_id is null
    or p_score is null
    or p_content is null then
    return query select false, 'invalid-format', null::uuid, null::uuid, null::text;
    return;
  end if;

  select *
  into v_appointment
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query select false, 'forbidden-not-found', null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_appointment.status = 'canceled' or v_appointment.ends_at > now() then
    return query select false, 'forbidden-not-ended', null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_appointment.creator_id <> p_user_id and not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query select false, 'forbidden-no-permission', null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_appointment.place_id is null then
    return query select false, 'invalid-reference', null::uuid, null::uuid, null::text;
    return;
  end if;

  v_edited_at := coalesce(p_edited_at, now());

  select *
  into v_review
  from public.user_review ur
  where ur.appointment_id = p_appointment_id
    and ur.user_id = p_user_id
  limit 1
  for update;

  if found then
    if v_review.score is not null
      or (v_review.review is not null and btrim(v_review.review) <> '') then
      v_mode := 'updated';
    else
      v_mode := 'created';
    end if;

    begin
      update public.user_review ur
      set
        score = p_score,
        review = p_content,
        place_id = v_appointment.place_id,
        edited_at = v_edited_at
      where ur.review_id = v_review.review_id;
    exception
      when foreign_key_violation or not_null_violation then
        return query select false, 'invalid-reference', null::uuid, null::uuid, null::text;
        return;
      when insufficient_privilege then
        return query select false, 'forbidden', null::uuid, null::uuid, null::text;
        return;
      when others then
        return query select false, 'server-error', null::uuid, null::uuid, null::text;
        return;
    end;
  else
    v_mode := 'created';
    begin
      insert into public.user_review (
        user_id,
        appointment_id,
        place_id,
        score,
        review,
        edited_at
      )
      values (
        p_user_id,
        p_appointment_id,
        v_appointment.place_id,
        p_score,
        p_content,
        v_edited_at
      );
    exception
      when unique_violation then
        return query select false, 'already-reviewed', null::uuid, null::uuid, null::text;
        return;
      when foreign_key_violation or not_null_violation then
        return query select false, 'invalid-reference', null::uuid, null::uuid, null::text;
        return;
      when insufficient_privilege then
        return query select false, 'forbidden', null::uuid, null::uuid, null::text;
        return;
      when others then
        return query select false, 'server-error', null::uuid, null::uuid, null::text;
        return;
    end;
  end if;

  return query
    select true, null::text, p_appointment_id, v_appointment.place_id, v_mode;
end;
$$;

revoke all on function public.submit_place_review_transactional(
  uuid,
  uuid,
  integer,
  text,
  timestamptz
) from public;
grant execute on function public.submit_place_review_transactional(
  uuid,
  uuid,
  integer,
  text,
  timestamptz
) to authenticated;

commit;
