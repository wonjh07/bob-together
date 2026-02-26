-- Email existence check for onboarding without exposing direct table access.

create or replace function public.check_email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.users
    where lower(email) = lower(trim(p_email))
  );
$$;

grant execute on function public.check_email_exists(text) to anon, authenticated;
