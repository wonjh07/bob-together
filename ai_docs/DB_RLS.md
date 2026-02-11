# DB / RLS Context

## Applied Migration
- `supabase/migrations/20260202092600_group_rls_policies.sql`
  - Enables RLS on: `groups`, `group_members`, `invitations`, `users`.
  - Grants select/insert/update/delete to `authenticated` (users is select only).
- `supabase/migrations/20260202121000_appointment_place_rls_policies.sql`
  - Enables RLS on: `places`, `appointments`, `appointment_members`.
  - Grants select/insert/update/delete to `authenticated`.
- `supabase/migrations/20260209143000_add_users_profile_image.sql`
  - Adds `users.profile_image` column.
  - Creates public storage bucket `profile-images`.
- `supabase/migrations/20260210162000_search_count_rpc.sql`
  - Adds `search_groups_with_count` RPC.
  - Adds `search_appointments_with_count` RPC.
  - Grants execute to `authenticated`.
- `supabase/migrations/20260210174000_get_appointment_detail_with_count.sql`
  - Adds `get_appointment_detail_with_count` RPC.
  - Grants execute to `authenticated`.
- `supabase/migrations/20260211193000_appointment_comments_rls_policies.sql`
  - Enables RLS on: `appointment_comments`.
  - Grants select/insert/update/delete to `authenticated`.
- `supabase/migrations/20260211201000_users_update_self_rls_policy.sql`
  - Grants `update` on `users` to `authenticated`.
  - Adds `users_update_self` policy (`user_id = auth.uid()`).
- `supabase/migrations/20260211203000_profile_images_storage_rls_policies.sql`
  - Grants `select/insert/update/delete` on `storage.objects` to `authenticated`.
  - Adds own-object policies for `profile-images` bucket based on object path prefix (`{auth.uid()}/...`).
- `supabase/migrations/20260211210000_appointment_members_select_group_member.sql`
  - Adds `appointment_members_select_group_member` policy.
  - Allows group members to read all members of appointments in their groups.
- `supabase/migrations/20260211213000_check_email_exists_rpc.sql`
  - Adds `check_email_exists` RPC (`security definer`).
  - Grants execute to `anon`, `authenticated`.

## Policies (summary)
- `groups_select_authenticated`: authenticated can select all groups.
- `groups_insert_owner`: insert allowed only when `owner_id = auth.uid()`.
- `group_members_select_self`: members can select their own membership rows.
- `group_members_insert_self_or_owner`: user can add self or group owner can add.
- `users_select_authenticated`: authenticated can read users.
- `users_update_self`: authenticated can update only their own users row.
- `profile_images_select_own`: users can read own objects in `profile-images`.
- `profile_images_insert_own`: users can upload only under own prefix in `profile-images`.
- `profile_images_update_own`: users can update only own objects in `profile-images`.
- `profile_images_delete_own`: users can delete only own objects in `profile-images`.
- `invitations_insert_group_member`: group members can create invitations.
- `places_*_authenticated`: authenticated can select/insert/update/delete places.
- `appointments_select_group_member`: group members can select appointments.
- `appointments_insert_group_member`: group members can create appointments as creator.
- `appointments_update_creator`: creator can update appointments.
- `appointments_delete_creator`: creator can delete appointments.
- `appointment_members_select_self`: members can select their own appointment rows.
- `appointment_members_select_group_member`: group members can read all appointment members in appointments belonging to their groups.
- `appointment_members_insert_self`: members can add themselves to appointments in their groups.
- `appointment_members_update_self`: members can update their own appointment rows.
- `appointment_members_delete_self`: members can delete their own appointment rows.
- `appointment_comments_select_group_member`: group members can view comments in appointments of their groups.
- `appointment_comments_insert_group_member_self`: group members can create comments only as self (`user_id = auth.uid()`).
- `appointment_comments_update_self`: users can update their own comments.
- `appointment_comments_delete_self`: users can delete their own comments.

## Notes
- If 403 errors occur, verify RLS policies and grants for the table.
- Search count RPCs are `security definer`; they must stay minimal and only return bounded, filtered fields.
- `check_email_exists` RPC returns boolean only and is intended for pre-login email duplication checks.
