begin;

drop function if exists public.respond_to_invitation_transactional(
  uuid,
  uuid,
  text
);

create function public.respond_to_invitation_transactional(
  p_user_id uuid,
  p_invitation_id uuid,
  p_decision text
)
returns table (
  ok boolean,
  error_code text,
  invitation_id uuid,
  invitation_type text,
  group_id uuid,
  appointment_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.invitations%rowtype;
  v_appointment_status public.appointment_status;
  v_appointment_ends_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query
      select false, 'forbidden', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  if p_decision not in ('accepted', 'rejected') then
    return query
      select false, 'invalid-format', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  select *
  into v_inv
  from public.invitations i
  where i.invitation_id = p_invitation_id
    and i.invitee_id = p_user_id
  for update;

  if not found then
    return query
      select false, 'invitation-not-found', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_inv.status <> 'pending' then
    return query
      select false, 'invitation-already-responded', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
    return;
  end if;

  if p_decision = 'accepted' then
    if v_inv.type = 'group' then
      begin
        insert into public.group_members (
          group_id,
          user_id,
          role
        )
        values (
          v_inv.group_id,
          p_user_id,
          'member'
        );
      exception
        when unique_violation then
          null;
        when others then
          return query
            select false, 'server-error', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
          return;
      end;
    elsif v_inv.type = 'appointment' then
      if v_inv.appointment_id is null then
        return query
          select false, 'invalid-invitation', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      if not exists (
        select 1
        from public.group_members gm
        where gm.group_id = v_inv.group_id
          and gm.user_id = p_user_id
      ) then
        return query
          select false, 'forbidden-group-membership', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      select
        a.status,
        a.ends_at
      into
        v_appointment_status,
        v_appointment_ends_at
      from public.appointments a
      where a.appointment_id = v_inv.appointment_id;

      if not found then
        return query
          select false, 'invitation-not-found', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      if v_appointment_status = 'canceled' then
        return query
          select false, 'forbidden-appointment-canceled', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      if v_appointment_ends_at <= now() then
        return query
          select false, 'forbidden-appointment-ended', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      begin
        insert into public.appointment_members (
          appointment_id,
          user_id,
          role
        )
        values (
          v_inv.appointment_id,
          p_user_id,
          'member'
        );
      exception
        when unique_violation then
          null;
        when insufficient_privilege then
          return query
            select false, 'forbidden-join-appointment', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
          return;
        when others then
          return query
            select false, 'server-error', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
          return;
      end;
    else
      return query
        select false, 'invalid-invitation', v_inv.invitation_id, null::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
      return;
    end if;
  end if;

  update public.invitations i
  set
    status = p_decision::public.invitation_status,
    responded_time = now()
  where i.invitation_id = v_inv.invitation_id
    and i.invitee_id = p_user_id
    and i.status = 'pending'
  returning i.*
  into v_inv;

  if not found then
    return query
      select false, 'invitation-already-responded', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  return query
    select true, null::text, v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
end;
$$;

revoke all on function public.respond_to_invitation_transactional(
  uuid,
  uuid,
  text
) from public;
grant execute on function public.respond_to_invitation_transactional(
  uuid,
  uuid,
  text
) to authenticated;

commit;
