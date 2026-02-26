begin;

drop function if exists public.send_group_invitation_transactional(
  uuid,
  uuid,
  uuid
);

create function public.send_group_invitation_transactional(
  p_inviter_id uuid,
  p_group_id uuid,
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
  v_exists boolean;
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden';
    return;
  end if;

  if p_inviter_id is null or p_group_id is null or p_invitee_id is null then
    return query select false, 'invalid-format';
    return;
  end if;

  if p_inviter_id = p_invitee_id then
    return query select false, 'invalid-format';
    return;
  end if;

  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_inviter_id
  )
  into v_exists;

  if not v_exists then
    return query select false, 'forbidden';
    return;
  end if;

  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_invitee_id
  )
  into v_exists;

  if v_exists then
    return query select false, 'already-member';
    return;
  end if;

  select exists (
    select 1
    from public.invitations i
    where i.group_id = p_group_id
      and i.invitee_id = p_invitee_id
      and i.type = 'group'
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
      inviter_id,
      invitee_id,
      type,
      status
    )
    values (
      p_group_id,
      p_inviter_id,
      p_invitee_id,
      'group',
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

revoke all on function public.send_group_invitation_transactional(
  uuid,
  uuid,
  uuid
) from public;
grant execute on function public.send_group_invitation_transactional(
  uuid,
  uuid,
  uuid
) to authenticated;

commit;
