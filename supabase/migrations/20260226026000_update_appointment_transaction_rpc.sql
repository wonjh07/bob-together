begin;

drop function if exists public.update_appointment_transactional(
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  uuid,
  text,
  text,
  text,
  text,
  double precision,
  double precision
);

create function public.update_appointment_transactional(
  p_user_id uuid,
  p_appointment_id uuid,
  p_title text,
  p_start_at timestamptz,
  p_ends_at timestamptz,
  p_place_id uuid default null,
  p_place_kakao_id text default null,
  p_place_name text default null,
  p_place_address text default null,
  p_place_category text default null,
  p_place_latitude double precision default null,
  p_place_longitude double precision default null
)
returns table (
  ok boolean,
  error_code text,
  appointment_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_id uuid;
  v_resolved_place_id uuid;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null
    or p_appointment_id is null
    or p_title is null
    or p_start_at is null
    or p_ends_at is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  select a.creator_id
  into v_creator_id
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query select false, 'appointment-not-found', null::uuid;
    return;
  end if;

  if v_creator_id <> p_user_id then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  v_resolved_place_id := p_place_id;

  if v_resolved_place_id is null then
    if p_place_kakao_id is null
      or p_place_name is null
      or p_place_address is null
      or p_place_latitude is null
      or p_place_longitude is null then
      return query select false, 'missing-place', null::uuid;
      return;
    end if;

    begin
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
      returning places.place_id
      into v_resolved_place_id;
    exception
      when others then
        return query select false, 'missing-place', null::uuid;
        return;
    end;
  end if;

  begin
    update public.appointments a
    set
      title = p_title,
      start_at = p_start_at,
      ends_at = p_ends_at,
      place_id = v_resolved_place_id
    where a.appointment_id = p_appointment_id;
  exception
    when foreign_key_violation then
      return query select false, 'missing-place', null::uuid;
      return;
    when others then
      return query select false, 'server-error', null::uuid;
      return;
  end;

  return query select true, null::text, p_appointment_id;
end;
$$;

revoke all on function public.update_appointment_transactional(
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  uuid,
  text,
  text,
  text,
  text,
  double precision,
  double precision
) from public;
grant execute on function public.update_appointment_transactional(
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  uuid,
  text,
  text,
  text,
  text,
  double precision,
  double precision
) to authenticated;

commit;
