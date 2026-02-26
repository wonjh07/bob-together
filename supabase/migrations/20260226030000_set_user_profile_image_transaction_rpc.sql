begin;

drop function if exists public.set_user_profile_image_transactional(
  uuid,
  text
);

create function public.set_user_profile_image_transactional(
  p_user_id uuid,
  p_profile_image text
)
returns table (
  ok boolean,
  error_code text,
  previous_profile_image text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous_profile_image text;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::text;
    return;
  end if;

  if p_user_id is null
    or p_profile_image is null
    or btrim(p_profile_image) = '' then
    return query select false, 'invalid-format', null::text;
    return;
  end if;

  select u.profile_image
  into v_previous_profile_image
  from public.users u
  where u.user_id = p_user_id
  for update;

  if not found then
    return query select false, 'not-found', null::text;
    return;
  end if;

  begin
    update public.users u
    set profile_image = p_profile_image
    where u.user_id = p_user_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::text;
      return;
    when others then
      return query select false, 'server-error', null::text;
      return;
  end;

  return query select true, null::text, v_previous_profile_image;
end;
$$;

revoke all on function public.set_user_profile_image_transactional(
  uuid,
  text
) from public;
grant execute on function public.set_user_profile_image_transactional(
  uuid,
  text
) to authenticated;

commit;
