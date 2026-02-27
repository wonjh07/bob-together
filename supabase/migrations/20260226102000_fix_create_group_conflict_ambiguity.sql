begin;

drop function if exists public.create_group_transactional(
  uuid,
  text
);

create function public.create_group_transactional(
  p_owner_id uuid,
  p_group_name text
)
returns table (
  ok boolean,
  error_code text,
  group_id uuid,
  group_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized_name text;
  v_created_group_id uuid;
  v_constraint_name text;
begin
  if p_owner_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid, null::text;
    return;
  end if;

  if p_owner_id is null then
    return query select false, 'invalid-format', null::uuid, null::text;
    return;
  end if;

  if not exists (
    select 1
    from public.users u
    where u.user_id = p_owner_id
  ) then
    return query select false, 'user-not-found', null::uuid, null::text;
    return;
  end if;

  v_normalized_name := btrim(coalesce(p_group_name, ''));

  if v_normalized_name = '' then
    return query select false, 'invalid-format', null::uuid, null::text;
    return;
  end if;

  if exists (
    select 1
    from public.groups g
    where g.name = v_normalized_name
    limit 1
  ) then
    return query select false, 'group-name-taken', null::uuid, null::text;
    return;
  end if;

  begin
    insert into public.groups (
      name,
      owner_id
    )
    values (
      v_normalized_name,
      p_owner_id
    )
    returning groups.group_id
    into v_created_group_id;
  exception
    when unique_violation then
      return query select false, 'group-name-taken', null::uuid, null::text;
      return;
    when foreign_key_violation then
      get stacked diagnostics v_constraint_name = CONSTRAINT_NAME;
      if v_constraint_name = 'groups_owner_id_fkey' then
        return query select false, 'user-not-found', null::uuid, null::text;
      else
        return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      end if;
      return;
    when not_null_violation or check_violation or invalid_text_representation or string_data_right_truncation then
      return query select false, 'invalid-format', null::uuid, null::text;
      return;
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid, null::text;
      return;
    when others then
      return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      return;
  end;

  begin
    insert into public.group_members (
      group_id,
      user_id,
      role
    )
    values (
      v_created_group_id,
      p_owner_id,
      'owner'
    )
    on conflict on constraint group_members_pkey do nothing;
  exception
    when foreign_key_violation then
      get stacked diagnostics v_constraint_name = CONSTRAINT_NAME;
      delete from public.groups g where g.group_id = v_created_group_id;
      if v_constraint_name = 'group_members_user_id_fkey' then
        return query select false, 'user-not-found', null::uuid, null::text;
      elsif v_constraint_name = 'group_members_group_id_fkey' then
        return query select false, 'group-not-found', null::uuid, null::text;
      else
        return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      end if;
      return;
    when not_null_violation or check_violation or invalid_text_representation or string_data_right_truncation then
      delete from public.groups g where g.group_id = v_created_group_id;
      return query select false, 'invalid-format', null::uuid, null::text;
      return;
    when insufficient_privilege then
      delete from public.groups g where g.group_id = v_created_group_id;
      return query select false, 'forbidden', null::uuid, null::text;
      return;
    when others then
      delete from public.groups g where g.group_id = v_created_group_id;
      return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      return;
  end;

  return query
    select true, null::text, v_created_group_id, v_normalized_name;
end;
$$;

revoke all on function public.create_group_transactional(
  uuid,
  text
) from public;
grant execute on function public.create_group_transactional(
  uuid,
  text
) to authenticated;

commit;
