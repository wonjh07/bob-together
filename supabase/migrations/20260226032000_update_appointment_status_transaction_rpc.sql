begin;

drop function if exists public.update_appointment_status_transactional(
  uuid,
  uuid,
  text
);

create function public.update_appointment_status_transactional(
  p_user_id uuid,
  p_appointment_id uuid,
  p_status text
)
returns table (
  ok boolean,
  error_code text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment public.appointments%rowtype;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::text;
    return;
  end if;

  if p_user_id is null
    or p_appointment_id is null
    or p_status is null then
    return query select false, 'invalid-format', null::text;
    return;
  end if;

  if p_status not in ('pending', 'canceled') then
    return query select false, 'invalid-format', null::text;
    return;
  end if;

  select *
  into v_appointment
  from public.appointments a
  where a.appointment_id = p_appointment_id
  for update;

  if not found then
    return query select false, 'not-found', null::text;
    return;
  end if;

  if v_appointment.creator_id <> p_user_id then
    return query select false, 'forbidden-not-owner', null::text;
    return;
  end if;

  if v_appointment.ends_at <= now() then
    return query select false, 'forbidden-ended', null::text;
    return;
  end if;

  begin
    update public.appointments a
    set status = p_status::public.appointment_status
    where a.appointment_id = p_appointment_id;
  exception
    when invalid_text_representation then
      return query select false, 'invalid-format', null::text;
      return;
    when insufficient_privilege then
      return query select false, 'forbidden', null::text;
      return;
    when others then
      return query select false, 'server-error', null::text;
      return;
  end;

  return query select true, null::text, p_status;
end;
$$;

revoke all on function public.update_appointment_status_transactional(
  uuid,
  uuid,
  text
) from public;
grant execute on function public.update_appointment_status_transactional(
  uuid,
  uuid,
  text
) to authenticated;

commit;
