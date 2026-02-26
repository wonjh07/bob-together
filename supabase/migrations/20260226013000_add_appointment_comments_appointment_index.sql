begin;

-- Appointment detail comments keyset pagination (active comments only)
-- query pattern:
-- - where appointment_id = ?
-- - and is_deleted = false and deleted_at is null
-- - order by created_at desc, comment_id desc
create index if not exists appointment_comments_appointment_created_id_active_idx
  on public.appointment_comments (appointment_id, created_at desc, comment_id desc)
  where is_deleted = false and deleted_at is null;

commit;
