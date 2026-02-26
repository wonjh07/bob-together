begin;

drop function if exists public.leave_appointment_transactional(
  uuid,
  uuid
);

create function public.leave_appointment_transactional(
  p_user_id uuid,
  p_appointment_id uuid
)
returns table (
  ok boolean,
  error_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_id uuid;
  v_status public.appointment_status;
  v_ends_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden';
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format';
    return;
  end if;

  select
    a.creator_id,
    a.status,
    a.ends_at
  into
    v_creator_id,
    v_status,
    v_ends_at
  from public.appointments a
  where a.appointment_id = p_appointment_id
  for update;

  if not found then
    return query select false, 'appointment-not-found';
    return;
  end if;

  if v_creator_id = p_user_id then
    return query select false, 'forbidden-owner';
    return;
  end if;

  if v_status = 'canceled' then
    return query select false, 'forbidden-appointment-canceled';
    return;
  end if;

  if v_ends_at <= now() then
    return query select false, 'forbidden-appointment-ended';
    return;
  end if;

  begin
    delete from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden';
      return;
    when others then
      return query select false, 'server-error';
      return;
  end;

  return query select true, null::text;
end;
$$;

revoke all on function public.leave_appointment_transactional(
  uuid,
  uuid
) from public;
grant execute on function public.leave_appointment_transactional(
  uuid,
  uuid
) to authenticated;

commit;
