begin;

drop function if exists public.search_appointment_invitable_users_transactional(
  uuid,
  uuid,
  text,
  integer,
  integer
);

create function public.search_appointment_invitable_users_transactional(
  p_inviter_id uuid,
  p_appointment_id uuid,
  p_query text,
  p_limit integer default 6,
  p_candidate_limit integer default 20
)
returns table (
  ok boolean,
  error_code text,
  users jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_status public.appointment_status;
  v_ends_at timestamptz;
  v_query text;
  v_users jsonb;
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::jsonb;
    return;
  end if;

  if p_inviter_id is null or p_appointment_id is null or p_query is null then
    return query select false, 'invalid-format', null::jsonb;
    return;
  end if;

  v_query := btrim(p_query);
  if v_query = '' then
    return query select false, 'invalid-format', null::jsonb;
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
    return query select false, 'forbidden', null::jsonb;
    return;
  end if;

  if v_status = 'canceled' then
    return query select false, 'forbidden-appointment-canceled', null::jsonb;
    return;
  end if;

  if v_ends_at <= now() then
    return query select false, 'forbidden-appointment-ended', null::jsonb;
    return;
  end if;

  if not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_inviter_id
  ) then
    return query select false, 'forbidden-not-member', null::jsonb;
    return;
  end if;

  with candidates as (
    select
      u.user_id,
      u.name,
      u.nickname
    from public.users u
    join public.group_members gm
      on gm.group_id = v_group_id
      and gm.user_id = u.user_id
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
      c.nickname
    from candidates c
    left join public.appointment_members am
      on am.appointment_id = p_appointment_id
      and am.user_id = c.user_id
    where am.user_id is null
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
    )
  into v_users
  from filtered f;

  return query select true, null::text, v_users;
end;
$$;

revoke all on function public.search_appointment_invitable_users_transactional(
  uuid,
  uuid,
  text,
  integer,
  integer
) from public;
grant execute on function public.search_appointment_invitable_users_transactional(
  uuid,
  uuid,
  text,
  integer,
  integer
) to authenticated;

commit;
