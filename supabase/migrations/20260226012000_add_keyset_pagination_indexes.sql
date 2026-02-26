begin;

-- Dashboard appointment list (group scoped, keyset by start_at + appointment_id)
create index if not exists appointments_group_start_at_id_idx
  on public.appointments (group_id, start_at desc, appointment_id desc);

-- History/reviewable lists (ended pending appointments, keyset by ends_at + appointment_id)
create index if not exists appointments_pending_ends_at_id_idx
  on public.appointments (ends_at desc, appointment_id desc)
  where status = 'pending';

-- Membership existence checks by current user
create index if not exists appointment_members_user_appointment_idx
  on public.appointment_members (user_id, appointment_id);

-- My comments list keyset pagination (active comments only)
create index if not exists appointment_comments_user_created_id_active_idx
  on public.appointment_comments (user_id, created_at desc, comment_id desc)
  where is_deleted = false and deleted_at is null;

-- Received invitations keyset pagination
create index if not exists invitations_invitee_created_id_active_idx
  on public.invitations (invitee_id, created_time desc, invitation_id desc)
  where status in ('pending', 'accepted', 'rejected');

-- Place reviews keyset pagination
create index if not exists user_review_place_updated_review_idx
  on public.user_review (place_id, updated_at desc, review_id desc)
  where appointment_id is not null
    and (score is not null or review is not null);

-- My reviews keyset pagination
create index if not exists user_review_user_updated_review_idx
  on public.user_review (user_id, updated_at desc, review_id desc)
  where appointment_id is not null
    and (score is not null or review is not null);

commit;
