begin;

drop table if exists public.user_notifications;
drop table if exists public.notifications;
drop type if exists public.notification_type;
drop type if exists public.notification_target_type;

create table if not exists public.user_invitation_read_state (
  user_id uuid primary key
    references public.users(user_id)
    on delete cascade,
  latest_received_created_time timestamptz null,
  latest_received_invitation_id uuid null,
  last_seen_created_time timestamptz null,
  last_seen_invitation_id uuid null,
  updated_at timestamptz not null default now()
);

alter table public.user_invitation_read_state enable row level security;

grant select on table public.user_invitation_read_state to authenticated, service_role;

drop policy if exists "Users can view own invitation read state"
  on public.user_invitation_read_state;

create policy "Users can view own invitation read state"
on public.user_invitation_read_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.refresh_user_invitation_read_state(
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_latest_created_time timestamptz;
  v_latest_invitation_id uuid;
begin
  if p_user_id is null then
    return;
  end if;

  insert into public.user_invitation_read_state (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select
    i.created_time,
    i.invitation_id
  into
    v_latest_created_time,
    v_latest_invitation_id
  from public.invitations i
  where i.invitee_id = p_user_id
  order by i.created_time desc, i.invitation_id desc
  limit 1;

  update public.user_invitation_read_state s
  set
    latest_received_created_time = v_latest_created_time,
    latest_received_invitation_id = v_latest_invitation_id,
    updated_at = now()
  where s.user_id = p_user_id;
end;
$$;

revoke all on function public.refresh_user_invitation_read_state(uuid) from public;
revoke all on function public.refresh_user_invitation_read_state(uuid) from anon;
revoke all on function public.refresh_user_invitation_read_state(uuid) from authenticated;

create or replace function public.sync_user_invitation_read_state_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_user_invitation_read_state(new.invitee_id);
  return new;
end;
$$;

revoke all on function public.sync_user_invitation_read_state_on_insert() from public;
revoke all on function public.sync_user_invitation_read_state_on_insert() from anon;
revoke all on function public.sync_user_invitation_read_state_on_insert() from authenticated;

drop trigger if exists sync_user_invitation_read_state_on_insert
  on public.invitations;

create trigger sync_user_invitation_read_state_on_insert
after insert on public.invitations
for each row
execute function public.sync_user_invitation_read_state_on_insert();

create or replace function public.has_unread_invitations(
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.user_invitation_read_state%rowtype;
begin
  if p_user_id is distinct from auth.uid() then
    return false;
  end if;

  select *
  into v_state
  from public.user_invitation_read_state s
  where s.user_id = p_user_id;

  if not found or v_state.latest_received_created_time is null then
    return false;
  end if;

  if v_state.last_seen_created_time is null then
    return true;
  end if;

  if v_state.latest_received_created_time > v_state.last_seen_created_time then
    return true;
  end if;

  if v_state.latest_received_created_time = v_state.last_seen_created_time
    and v_state.latest_received_invitation_id is distinct from v_state.last_seen_invitation_id then
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.has_unread_invitations(uuid) from public;
revoke all on function public.has_unread_invitations(uuid) from anon;
grant execute on function public.has_unread_invitations(uuid) to authenticated, service_role;

create or replace function public.mark_user_invitation_read_state_seen(
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is distinct from auth.uid() then
    return false;
  end if;

  insert into public.user_invitation_read_state (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  update public.user_invitation_read_state s
  set
    last_seen_created_time = s.latest_received_created_time,
    last_seen_invitation_id = s.latest_received_invitation_id,
    updated_at = now()
  where s.user_id = p_user_id;

  return true;
end;
$$;

revoke all on function public.mark_user_invitation_read_state_seen(uuid) from public;
revoke all on function public.mark_user_invitation_read_state_seen(uuid) from anon;
grant execute on function public.mark_user_invitation_read_state_seen(uuid) to authenticated, service_role;

with latest_invitations as (
  select distinct on (i.invitee_id)
    i.invitee_id as user_id,
    i.created_time,
    i.invitation_id
  from public.invitations i
  order by i.invitee_id, i.created_time desc, i.invitation_id desc
)
insert into public.user_invitation_read_state (
  user_id,
  latest_received_created_time,
  latest_received_invitation_id,
  last_seen_created_time,
  last_seen_invitation_id,
  updated_at
)
select
  li.user_id,
  li.created_time,
  li.invitation_id,
  li.created_time,
  li.invitation_id,
  now()
from latest_invitations li
on conflict (user_id) do update
set
  latest_received_created_time = excluded.latest_received_created_time,
  latest_received_invitation_id = excluded.latest_received_invitation_id,
  last_seen_created_time = excluded.last_seen_created_time,
  last_seen_invitation_id = excluded.last_seen_invitation_id,
  updated_at = now();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_invitation_read_state'
  ) then
    alter publication supabase_realtime add table public.user_invitation_read_state;
  end if;
end;
$$;

commit;
