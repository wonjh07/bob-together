# DB / RLS Context

## Applied Migration
- `supabase/migrations/20260202092600_group_rls_policies.sql`
  - Enables RLS on: `groups`, `group_members`, `invitations`, `users`.
  - Grants select/insert/update/delete to `authenticated` (users is select only).
- `supabase/migrations/20260202121000_appointment_place_rls_policies.sql`
  - Enables RLS on: `places`, `appointments`, `appointment_members`.
  - Grants select/insert/update/delete to `authenticated`.

## Policies (summary)
- `groups_select_authenticated`: authenticated can select all groups.
- `groups_insert_owner`: insert allowed only when `owner_id = auth.uid()`.
- `group_members_select_self`: members can select their own membership rows.
- `group_members_insert_self_or_owner`: user can add self or group owner can add.
- `users_select_authenticated`: authenticated can read users.
- `invitations_insert_group_member`: group members can create invitations.
- `places_*_authenticated`: authenticated can select/insert/update/delete places.
- `appointments_select_group_member`: group members can select appointments.
- `appointments_insert_group_member`: group members can create appointments as creator.
- `appointments_update_creator`: creator can update appointments.
- `appointments_delete_creator`: creator can delete appointments.
- `appointment_members_select_self`: members can select their own appointment rows.
- `appointment_members_insert_self`: members can add themselves to appointments in their groups.
- `appointment_members_update_self`: members can update their own appointment rows.
- `appointment_members_delete_self`: members can delete their own appointment rows.

## Notes
- If 403 errors occur, verify RLS policies and grants for the table.
