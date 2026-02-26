begin;

drop function if exists public.get_appointment_review_target_transactional(
  uuid,
  uuid
);

create function public.get_appointment_review_target_transactional(
  p_user_id uuid,
  p_appointment_id uuid
)
returns table (
  ok boolean,
  error_code text,
  appointment_id uuid,
  title text,
  start_at timestamptz,
  ends_at timestamptz,
  place_id uuid,
  place_name text,
  place_address text,
  place_category text,
  review_avg double precision,
  review_count bigint,
  my_score integer,
  my_review text,
  has_my_review_row boolean,
  has_reviewed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment public.appointments%rowtype;
  v_place public.places%rowtype;
  v_review_avg double precision;
  v_review_count bigint;
  v_my_score integer;
  v_my_review text;
  v_has_my_review_row boolean;
begin
  if p_user_id is distinct from auth.uid() then
    return query
      select
        false,
        'forbidden',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query
      select
        false,
        'invalid-format',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  select *
  into v_appointment
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query
      select
        false,
        'forbidden-not-found',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  if v_appointment.status = 'canceled' or v_appointment.ends_at > now() then
    return query
      select
        false,
        'forbidden-not-ended',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  if v_appointment.creator_id <> p_user_id and not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query
      select
        false,
        'forbidden-no-permission',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean;
    return;
  end if;

  if v_appointment.place_id is not null then
    select *
    into v_place
    from public.places p
    where p.place_id = v_appointment.place_id;

    select
      round(avg(ur.score)::numeric, 1)::double precision,
      count(*)::bigint
    into
      v_review_avg,
      v_review_count
    from public.user_review ur
    where ur.place_id = v_appointment.place_id
      and ur.appointment_id is not null
      and (ur.score is not null or ur.review is not null);
  end if;

  select
    ur.score,
    ur.review
  into
    v_my_score,
    v_my_review
  from public.user_review ur
  where ur.appointment_id = p_appointment_id
    and ur.user_id = p_user_id
  limit 1;
  v_has_my_review_row := found;

  return query
    select
      true,
      null::text,
      v_appointment.appointment_id,
      v_appointment.title,
      v_appointment.start_at,
      v_appointment.ends_at,
      v_appointment.place_id,
      v_place.name,
      v_place.address,
      v_place.category,
      v_review_avg,
      coalesce(v_review_count, 0),
      v_my_score,
      v_my_review,
      v_has_my_review_row,
      (v_my_score is not null or (v_my_review is not null and btrim(v_my_review) <> ''));
end;
$$;

revoke all on function public.get_appointment_review_target_transactional(
  uuid,
  uuid
) from public;
grant execute on function public.get_appointment_review_target_transactional(
  uuid,
  uuid
) to authenticated;

commit;
