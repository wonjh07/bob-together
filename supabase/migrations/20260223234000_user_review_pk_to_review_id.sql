-- Fix review ownership PK mismatch after user_places -> user_review migration.
-- Goal:
-- - Remove legacy composite PK(user_id, place_id) that blocks multiple appointment reviews per place
-- - Add surrogate PK(review_id)
-- - Keep unique(user_id, appointment_id) for appointment-scoped 1 review rule

begin;

create extension if not exists pgcrypto with schema extensions;

alter table if exists public.user_review
  add column if not exists review_id uuid;

update public.user_review
set review_id = extensions.gen_random_uuid()
where review_id is null;

alter table public.user_review
  alter column review_id set default extensions.gen_random_uuid();

alter table public.user_review
  alter column review_id set not null;

do $$
declare
  existing_pk text;
  existing_pk_columns text[];
begin
  select c.conname, array_agg(a.attname::text order by k.ord)
  into existing_pk, existing_pk_columns
  from pg_constraint c
  join unnest(c.conkey) with ordinality as k(attnum, ord) on true
  join pg_attribute a
    on a.attrelid = c.conrelid
   and a.attnum = k.attnum
  where c.conrelid = 'public.user_review'::regclass
    and c.contype = 'p'
  group by c.conname
  limit 1;

  if existing_pk is not null and existing_pk_columns <> array['review_id']::text[] then
    execute format(
      'alter table public.user_review drop constraint %I',
      existing_pk
    );
  end if;

  if not exists (
    select 1
    from pg_constraint c
    join unnest(c.conkey) with ordinality as k(attnum, ord) on true
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = k.attnum
    where c.conrelid = 'public.user_review'::regclass
      and c.contype = 'p'
    group by c.oid
    having array_agg(a.attname::text order by k.ord) = array['review_id']::text[]
  ) then
    alter table public.user_review
      add constraint user_review_pkey primary key (review_id);
  end if;
end $$;

create unique index if not exists user_review_user_id_appointment_id_uidx
on public.user_review(user_id, appointment_id)
where appointment_id is not null;

commit;
