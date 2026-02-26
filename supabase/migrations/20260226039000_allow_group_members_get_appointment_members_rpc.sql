begin;

drop function if exists public.get_appointment_members_with_count(
  uuid,
  uuid
);

create function public.get_appointment_members_with_count(
  p_user_id uuid,
  p_appointment_id uuid
)
returns table (
  ok boolean,
  error_code text,
  member_count integer,
  members jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_count integer;
  v_members jsonb;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', 0, '[]'::jsonb;
    return;
  end if;

  if not exists (
    select 1
    from public.appointments a
    join public.group_members gm
      on gm.group_id = a.group_id
     and gm.user_id = p_user_id
    where a.appointment_id = p_appointment_id
  ) then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'user_id', mr.user_id,
          'role', mr.role,
          'name', mr.name,
          'nickname', mr.nickname,
          'profile_image', mr.profile_image
        )
        order by mr.joined_at asc
      ),
      '[]'::jsonb
    )
  into
    v_member_count,
    v_members
  from (
    select
      am.user_id,
      am.role,
      am.joined_at,
      u.name,
      u.nickname,
      u.profile_image
    from public.appointment_members am
    left join public.users u
      on u.user_id = am.user_id
    where am.appointment_id = p_appointment_id
  ) mr;

  return query select true, null::text, coalesce(v_member_count, 0), v_members;
exception
  when insufficient_privilege then
    return query select false, 'forbidden', 0, '[]'::jsonb;
  when others then
    return query select false, 'server-error', 0, '[]'::jsonb;
end;
$$;

revoke all on function public.get_appointment_members_with_count(
  uuid,
  uuid
) from public;
grant execute on function public.get_appointment_members_with_count(
  uuid,
  uuid
) to authenticated;

commit;
