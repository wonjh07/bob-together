begin;

drop function if exists public.send_appointment_invitation_transactional(
  uuid,
  uuid,
  uuid
);

create function public.send_appointment_invitation_transactional(
  p_inviter_id uuid,
  p_appointment_id uuid,
  p_invitee_id uuid
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
  v_app public.appointments%rowtype;
  v_exists boolean;
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden';
    return;
  end if;

  if p_inviter_id is null or p_appointment_id is null or p_invitee_id is null then
    return query select false, 'invalid-format';
    return;
  end if;

  if p_inviter_id = p_invitee_id then
    return query select false, 'invalid-format';
    return;
  end if;

  select *
  into v_app
  from public.appointments a
  where a.appointment_id = p_appointment_id
  for update;

  if not found then
    return query select false, 'appointment-not-found';
    return;
  end if;

  if v_app.status = 'canceled' then
    return query select false, 'forbidden-appointment-canceled';
    return;
  end if;

  if v_app.ends_at <= now() then
    return query select false, 'forbidden-appointment-ended';
    return;
  end if;

  select exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_inviter_id
  )
  into v_exists;

  if not v_exists then
    return query select false, 'forbidden-not-appointment-member';
    return;
  end if;

  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = v_app.group_id
      and gm.user_id = p_invitee_id
  )
  into v_exists;

  if not v_exists then
    return query select false, 'forbidden-invitee-not-group-member';
    return;
  end if;

  select exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_invitee_id
  )
  into v_exists;

  if v_exists then
    return query select false, 'already-member';
    return;
  end if;

  select exists (
    select 1
    from public.invitations i
    where i.appointment_id = p_appointment_id
      and i.invitee_id = p_invitee_id
      and i.type = 'appointment'
      and i.status = 'pending'
  )
  into v_exists;

  if v_exists then
    return query select false, 'invite-already-sent';
    return;
  end if;

  begin
    insert into public.invitations (
      group_id,
      appointment_id,
      inviter_id,
      invitee_id,
      type,
      status
    )
    values (
      v_app.group_id,
      p_appointment_id,
      p_inviter_id,
      p_invitee_id,
      'appointment',
      'pending'
    );
  exception
    when unique_violation then
      return query select false, 'invite-already-sent';
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

revoke all on function public.send_appointment_invitation_transactional(
  uuid,
  uuid,
  uuid
) from public;
grant execute on function public.send_appointment_invitation_transactional(
  uuid,
  uuid,
  uuid
) to authenticated;

commit;
