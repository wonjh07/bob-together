begin;

drop function if exists public.list_received_invitations_with_cursor(
  integer,
  timestamptz,
  uuid
);

create function public.list_received_invitations_with_cursor(
  p_limit integer default 10,
  p_cursor_created_time timestamptz default null,
  p_cursor_invitation_id uuid default null
)
returns table (
  invitation_id uuid,
  type text,
  status text,
  created_time timestamptz,
  group_id uuid,
  appointment_id uuid,
  inviter_id uuid,
  inviter_name text,
  inviter_nickname text,
  inviter_profile_image text,
  group_name text,
  appointment_title text,
  appointment_ends_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    i.invitation_id,
    i.type::text,
    i.status::text,
    i.created_time,
    i.group_id,
    i.appointment_id,
    u.user_id as inviter_id,
    u.name as inviter_name,
    u.nickname as inviter_nickname,
    u.profile_image as inviter_profile_image,
    g.name as group_name,
    a.title as appointment_title,
    a.ends_at as appointment_ends_at
  from public.invitations i
  left join public.users u on u.user_id = i.inviter_id
  left join public.groups g on g.group_id = i.group_id
  left join public.appointments a on a.appointment_id = i.appointment_id
  where i.invitee_id = auth.uid()
    and i.status in ('pending', 'accepted', 'rejected')
    and (
      p_cursor_created_time is null
      or (
        i.created_time,
        i.invitation_id
      ) < (
        p_cursor_created_time,
        p_cursor_invitation_id
      )
    )
  order by i.created_time desc, i.invitation_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;

revoke all on function public.list_received_invitations_with_cursor(
  integer,
  timestamptz,
  uuid
) from public;
grant execute on function public.list_received_invitations_with_cursor(
  integer,
  timestamptz,
  uuid
) to authenticated;

commit;
