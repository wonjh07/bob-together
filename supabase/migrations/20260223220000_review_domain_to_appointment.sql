-- Convert place-based review ownership to appointment-based ownership.
-- - Rename user_places -> user_review
-- - Add appointment_id reference and backfill from latest ended participated appointment
-- - Rebuild RLS policies for appointment-based review permissions
-- - Update review aggregation RPCs to read from user_review

begin;

do $$
begin
  if to_regclass('public.user_review') is null
     and to_regclass('public.user_places') is not null then
    alter table public.user_places rename to user_review;
  end if;
end $$;

alter table if exists public.user_review
  add column if not exists appointment_id uuid;

do $$
begin
  if to_regclass('public.user_review') is null then
    return;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_review'::regclass
      and conname = 'user_review_appointment_id_fkey'
  ) then
    alter table public.user_review
      add constraint user_review_appointment_id_fkey
      foreign key (appointment_id)
      references public.appointments(appointment_id)
      on delete set null;
  end if;
end $$;

create unique index if not exists user_review_user_id_appointment_id_uidx
on public.user_review(user_id, appointment_id)
where appointment_id is not null;

create index if not exists user_review_place_id_idx
on public.user_review(place_id);

create index if not exists user_review_appointment_id_idx
on public.user_review(appointment_id);

with ranked as (
  select
    ur.user_id,
    ur.place_id,
    a.appointment_id,
    row_number() over (
      partition by ur.user_id, ur.place_id
      order by a.ends_at desc, a.appointment_id desc
    ) as rn
  from public.user_review ur
  join public.appointments a
    on a.place_id = ur.place_id
   and a.status <> 'canceled'
   and a.ends_at <= now()
  where ur.appointment_id is null
    and (
      a.creator_id = ur.user_id
      or exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = ur.user_id
      )
    )
)
update public.user_review ur
set appointment_id = ranked.appointment_id
from ranked
where ranked.rn = 1
  and ur.user_id = ranked.user_id
  and ur.place_id = ranked.place_id
  and ur.appointment_id is null;

alter table public.user_review enable row level security;
grant select, insert, update, delete on public.user_review to authenticated;

drop policy if exists "user_places_select_authenticated" on public.user_review;
drop policy if exists "user_places_insert_self" on public.user_review;
drop policy if exists "user_places_update_self" on public.user_review;
drop policy if exists "user_places_delete_self" on public.user_review;

drop policy if exists "user_review_select_authenticated" on public.user_review;
drop policy if exists "user_review_insert_self_for_ended_appointment" on public.user_review;
drop policy if exists "user_review_update_self_for_ended_appointment" on public.user_review;
drop policy if exists "user_review_delete_self" on public.user_review;

create policy "user_review_select_authenticated"
on public.user_review
for select
to authenticated
using (true);

create policy "user_review_insert_self_for_ended_appointment"
on public.user_review
for insert
to authenticated
with check (
  user_id = auth.uid()
  and appointment_id is not null
  and exists (
    select 1
    from public.appointments a
    where a.appointment_id = user_review.appointment_id
      and a.status <> 'canceled'
      and a.ends_at <= now()
      and (
        a.creator_id = auth.uid()
        or exists (
          select 1
          from public.appointment_members am
          where am.appointment_id = a.appointment_id
            and am.user_id = auth.uid()
        )
      )
  )
);

create policy "user_review_update_self_for_ended_appointment"
on public.user_review
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
  and appointment_id is not null
  and exists (
    select 1
    from public.appointments a
    where a.appointment_id = user_review.appointment_id
      and a.status <> 'canceled'
      and a.ends_at <= now()
      and (
        a.creator_id = auth.uid()
        or exists (
          select 1
          from public.appointment_members am
          where am.appointment_id = a.appointment_id
            and am.user_id = auth.uid()
        )
      )
  )
);

create policy "user_review_delete_self"
on public.user_review
for delete
to authenticated
using (user_id = auth.uid());

create or replace function public.get_appointment_detail_with_count(
  p_user_id uuid,
  p_appointment_id uuid
)
returns table (
  appointment_id uuid,
  title text,
  status public.appointment_status,
  start_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz,
  creator_id uuid,
  creator_name text,
  creator_nickname text,
  creator_profile_image text,
  place_id uuid,
  place_name text,
  place_address text,
  place_category text,
  place_latitude double precision,
  place_longitude double precision,
  member_count bigint,
  is_member boolean,
  review_avg numeric,
  review_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    a.appointment_id,
    a.title,
    a.status,
    a.start_at,
    a.ends_at,
    a.created_at,
    a.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    u.profile_image as creator_profile_image,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    p.latitude as place_latitude,
    p.longitude as place_longitude,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count,
    exists (
      select 1
      from public.appointment_members am_me
      where am_me.appointment_id = a.appointment_id
        and am_me.user_id = p_user_id
    ) as is_member,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join public.users u
    on u.user_id = a.creator_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where a.appointment_id = p_appointment_id
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
  limit 1;
$$;

revoke all on function public.get_appointment_detail_with_count(uuid, uuid) from public;
grant execute on function public.get_appointment_detail_with_count(uuid, uuid) to authenticated;

create or replace function public.list_reviewable_appointments_with_stats(
  p_user_id uuid,
  p_offset integer default 0,
  p_limit integer default 6
)
returns table (
  appointment_id uuid,
  title text,
  start_at timestamptz,
  ends_at timestamptz,
  place_id uuid,
  place_name text,
  review_avg numeric,
  review_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    a.appointment_id,
    a.title,
    a.start_at,
    a.ends_at,
    p.place_id,
    p.name as place_name,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where a.status <> 'canceled'
    and a.ends_at <= now()
    and (
      a.creator_id = p_user_id
      or exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
      )
    )
    and not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = a.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    )
  order by a.ends_at desc, a.appointment_id desc
  offset greatest(p_offset, 0)
  limit greatest(p_limit, 1) + 1;
$$;

revoke all on function public.list_reviewable_appointments_with_stats(uuid, integer, integer) from public;
grant execute on function public.list_reviewable_appointments_with_stats(uuid, integer, integer) to authenticated;

commit;
