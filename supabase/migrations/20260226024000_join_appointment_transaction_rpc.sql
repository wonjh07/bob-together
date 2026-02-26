begin;

drop function if exists public.join_appointment_transactional(
  uuid,
  uuid
);

create function public.join_appointment_transactional(
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
  v_group_id uuid;
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
    a.group_id,
    a.status,
    a.ends_at
  into
    v_group_id,
    v_status,
    v_ends_at
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query select false, 'appointment-not-found';
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

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = v_group_id
      and gm.user_id = p_user_id
  ) then
    return query select false, 'forbidden-not-group-member';
    return;
  end if;

  begin
    insert into public.appointment_members (
      appointment_id,
      user_id,
      role
    )
    values (
      p_appointment_id,
      p_user_id,
      'member'
    );
  exception
    when unique_violation then
      return query select false, 'already-member';
      return;
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

revoke all on function public.join_appointment_transactional(
  uuid,
  uuid
) from public;
grant execute on function public.join_appointment_transactional(
  uuid,
  uuid
) to authenticated;

commit;
