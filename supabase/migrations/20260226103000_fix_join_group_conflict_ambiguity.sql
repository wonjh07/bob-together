begin;

drop function if exists public.join_group_transactional(
  uuid,
  uuid
);

create function public.join_group_transactional(
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
  v_constraint_name text;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null or p_group_id is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.users u
    where u.user_id = p_user_id
  ) then
    return query select false, 'user-not-found', null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.groups g
    where g.group_id = p_group_id
  ) then
    return query select false, 'group-not-found', null::uuid;
    return;
  end if;

  begin
    insert into public.group_members (
      group_id,
      user_id,
      role
    )
    values (
      p_group_id,
      p_user_id,
      'member'
    )
    on conflict on constraint group_members_pkey do nothing;
  exception
    when foreign_key_violation then
      get stacked diagnostics v_constraint_name = CONSTRAINT_NAME;
      if v_constraint_name = 'group_members_user_id_fkey' then
        return query select false, 'user-not-found', null::uuid;
      elsif v_constraint_name = 'group_members_group_id_fkey' then
        return query select false, 'group-not-found', null::uuid;
      else
        return query select false, 'server-error:' || SQLSTATE, null::uuid;
      end if;
      return;
    when not_null_violation or check_violation or invalid_text_representation or string_data_right_truncation then
      return query select false, 'invalid-format', null::uuid;
      return;
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error:' || SQLSTATE, null::uuid;
      return;
  end;

  return query select true, null::text, p_group_id;
end;
$$;

revoke all on function public.join_group_transactional(
  uuid,
  uuid
) from public;
grant execute on function public.join_group_transactional(
  uuid,
  uuid
) to authenticated;

commit;
