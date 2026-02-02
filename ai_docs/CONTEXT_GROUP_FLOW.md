# Group Flow

## Routes
- `/group`: entry page (no groups yet)
- `/group/join`: search groups
- `/group/join/confirm`: confirm join
- `/group/join/complete`: join complete
- `/group/create`: create group
- `/group/create/complete`: create complete
- `/group/invitation`: invite members
- `/group/invitation/complete`: invite complete

## Server Actions
- `createGroupAction`
- `findGroupByNameAction`
- `searchGroupsAction`
- `joinGroupAction`
- `getGroupByIdAction`
- `searchUsersAction`
- `sendGroupInvitationAction`
- `getMyGroupsAction`

## RLS Migration
- `supabase/migrations/20260202092600_group_rls_policies.sql`
  - enables RLS on groups/group_members/invitations/users
  - grants select/insert to authenticated

## UI Notes
- Search results show cards under input
- Join and invite flows use common shared styles in `src/app/(onboarding)/group/shared.css.ts`
