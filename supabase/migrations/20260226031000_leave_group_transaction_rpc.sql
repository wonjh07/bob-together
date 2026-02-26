begin;

drop function if exists public.leave_group_transactional(
  uuid,
  uuid
);

create function public.leave_group_transactional(
  p_user_id uuid,
  p_group_id uuid
)
returns table (
  ok boolean,
  error_code text,
  group_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null or p_group_id is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  select gm.role
  into v_role
  from public.group_members gm
  where gm.group_id = p_group_id
    and gm.user_id = p_user_id
  for update;

  if not found then
    return query select true, null::text, p_group_id;
    return;
  end if;

  if v_role = 'owner' then
    return query select false, 'forbidden-owner', null::uuid;
    return;
  end if;

  begin
    delete from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error', null::uuid;
      return;
  end;

  return query select true, null::text, p_group_id;
end;
$$;

revoke all on function public.leave_group_transactional(
  uuid,
  uuid
) from public;
grant execute on function public.leave_group_transactional(
  uuid,
  uuid
) to authenticated;

commit;
