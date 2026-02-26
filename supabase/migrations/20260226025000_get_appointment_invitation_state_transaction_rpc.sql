begin;

drop function if exists public.get_appointment_invitation_state_transactional(
  uuid,
  uuid
);

create function public.get_appointment_invitation_state_transactional(
  p_user_id uuid,
  p_appointment_id uuid
)
returns table (
  ok boolean,
  error_code text,
  member_ids uuid[],
  pending_invitee_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_ids uuid[];
  v_pending_ids uuid[];
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid[], null::uuid[];
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', null::uuid[], null::uuid[];
    return;
  end if;

  if not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query select false, 'forbidden', null::uuid[], null::uuid[];
    return;
  end if;

  select
    coalesce(array_agg(distinct am.user_id), '{}'::uuid[])
  into v_member_ids
  from public.appointment_members am
  where am.appointment_id = p_appointment_id;

  select
    coalesce(array_agg(distinct i.invitee_id), '{}'::uuid[])
  into v_pending_ids
  from public.invitations i
  where i.appointment_id = p_appointment_id
    and i.type = 'appointment'
    and i.status = 'pending';

  return query
    select true, null::text, v_member_ids, v_pending_ids;
end;
$$;

revoke all on function public.get_appointment_invitation_state_transactional(
  uuid,
  uuid
) from public;
grant execute on function public.get_appointment_invitation_state_transactional(
  uuid,
  uuid
) to authenticated;

commit;
