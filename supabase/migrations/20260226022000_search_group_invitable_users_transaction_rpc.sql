begin;

drop function if exists public.search_group_invitable_users_transactional(
  uuid,
  uuid,
  text,
  integer,
  integer
);

create function public.search_group_invitable_users_transactional(
  p_inviter_id uuid,
  p_group_id uuid,
  p_query text,
  p_limit integer default 6,
  p_candidate_limit integer default 20
)
returns table (
  ok boolean,
  error_code text,
  users jsonb,
  pending_invitee_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_query text;
  v_result_users jsonb;
  v_pending_invitee_ids uuid[];
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::jsonb, null::uuid[];
    return;
  end if;

  if p_inviter_id is null or p_group_id is null or p_query is null then
    return query select false, 'invalid-format', null::jsonb, null::uuid[];
    return;
  end if;

  v_query := btrim(p_query);
  if v_query = '' then
    return query select false, 'invalid-format', null::jsonb, null::uuid[];
    return;
  end if;

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_inviter_id
  ) then
    return query select false, 'forbidden', null::jsonb, null::uuid[];
    return;
  end if;

  with candidates as (
    select
      u.user_id,
      u.name,
      u.nickname
    from public.users u
    where u.user_id <> p_inviter_id
      and (
        u.nickname ilike '%' || v_query || '%'
        or u.name ilike '%' || v_query || '%'
      )
    limit greatest(coalesce(p_candidate_limit, 20), 1)
  ),
  filtered as (
    select
      c.user_id,
      c.name,
      c.nickname,
      exists (
        select 1
        from public.invitations i
        where i.group_id = p_group_id
          and i.type = 'group'
          and i.status = 'pending'
          and i.invitee_id = c.user_id
      ) as is_pending
    from candidates c
    left join public.group_members gm
      on gm.group_id = p_group_id
      and gm.user_id = c.user_id
    where gm.user_id is null
    limit greatest(coalesce(p_limit, 6), 1)
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'user_id', f.user_id,
          'name', f.name,
          'nickname', f.nickname
        )
      ),
      '[]'::jsonb
    ),
    coalesce(
      array_agg(f.user_id) filter (where f.is_pending),
      '{}'::uuid[]
    )
  into
    v_result_users,
    v_pending_invitee_ids
  from filtered f;

  return query
    select true, null::text, v_result_users, v_pending_invitee_ids;
end;
$$;

revoke all on function public.search_group_invitable_users_transactional(
  uuid,
  uuid,
  text,
  integer,
  integer
) from public;
grant execute on function public.search_group_invitable_users_transactional(
  uuid,
  uuid,
  text,
  integer,
  integer
) to authenticated;

commit;
