begin;

drop function if exists public.create_appointment_with_owner_member(
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  text,
  double precision,
  double precision
);

create function public.create_appointment_with_owner_member(
  p_user_id uuid,
  p_group_id uuid,
  p_title text,
  p_start_at timestamptz,
  p_ends_at timestamptz,
  p_place_kakao_id text,
  p_place_name text,
  p_place_address text,
  p_place_category text default '',
  p_place_latitude double precision default null,
  p_place_longitude double precision default null
)
returns table (
  appointment_id uuid,
  place_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_place_id uuid;
  v_appointment_id uuid;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'invalid user context'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
  ) then
    raise exception 'group membership required'
      using errcode = '42501';
  end if;

  insert into public.places (
    kakao_id,
    name,
    address,
    category,
    latitude,
    longitude
  )
  values (
    p_place_kakao_id,
    p_place_name,
    p_place_address,
    coalesce(p_place_category, ''),
    p_place_latitude,
    p_place_longitude
  )
  on conflict (kakao_id) do update
    set
      name = excluded.name,
      address = excluded.address,
      category = excluded.category,
      latitude = excluded.latitude,
      longitude = excluded.longitude
  returning places.place_id into v_place_id;

  insert into public.appointments (
    title,
    creator_id,
    group_id,
    start_at,
    ends_at,
    place_id,
    status
  )
  values (
    p_title,
    p_user_id,
    p_group_id,
    p_start_at,
    p_ends_at,
    v_place_id,
    'pending'
  )
  returning appointments.appointment_id into v_appointment_id;

  insert into public.appointment_members (
    appointment_id,
    user_id,
    role
  )
  values (
    v_appointment_id,
    p_user_id,
    'owner'
  );

  return query
    select v_appointment_id, v_place_id;
end;
$$;

revoke all on function public.create_appointment_with_owner_member(
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  text,
  double precision,
  double precision
) from public;
grant execute on function public.create_appointment_with_owner_member(
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  text,
  double precision,
  double precision
) to authenticated;

commit;
