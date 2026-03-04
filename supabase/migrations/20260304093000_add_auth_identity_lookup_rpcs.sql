begin;

create or replace function public.find_masked_email_by_identity(
  p_name text,
  p_nickname text
)
returns table(masked_email text)
language sql
security definer
set search_path = public
as $$
  with target as (
    select u.email
    from public.users u
    where u.name = trim(p_name)
      and u.nickname = trim(p_nickname)
      and u.email is not null
    order by u.created_at desc
    limit 1
  ),
  parsed as (
    select
      split_part(email, '@', 1) as local_part,
      split_part(email, '@', 2) as domain_part
    from target
  )
  select
    case
      when local_part = '' or domain_part = '' then null
      when char_length(local_part) <= 2 then left(local_part, 1) || '*@' || domain_part
      else left(local_part, 2) || repeat('*', greatest(char_length(local_part) - 2, 0)) || '@' || domain_part
    end as masked_email
  from parsed
  where local_part <> ''
    and domain_part <> '';
$$;

create or replace function public.find_user_id_for_password_reset(
  p_email text,
  p_name text
)
returns table(user_id uuid)
language sql
security definer
set search_path = public
as $$
  select u.user_id
  from public.users u
  where lower(u.email) = lower(trim(p_email))
    and u.name = trim(p_name)
  order by u.created_at desc
  limit 1;
$$;

revoke all on function public.find_masked_email_by_identity(text, text) from public;
revoke all on function public.find_masked_email_by_identity(text, text) from anon;
revoke all on function public.find_masked_email_by_identity(text, text) from authenticated;
grant execute on function public.find_masked_email_by_identity(text, text) to service_role;

revoke all on function public.find_user_id_for_password_reset(text, text) from public;
revoke all on function public.find_user_id_for_password_reset(text, text) from anon;
revoke all on function public.find_user_id_for_password_reset(text, text) from authenticated;
grant execute on function public.find_user_id_for_password_reset(text, text) to service_role;

commit;
