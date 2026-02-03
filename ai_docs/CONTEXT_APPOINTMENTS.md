# Appointment Flow

## Routes
- `/dashboard`: appointment list (main dashboard)
- `/dashboard/appointments/create`: appointment creation wizard
- `/dashboard/appointments/invitation`: invite members
- `/dashboard/appointments/invitation/complete`: invite complete

## Structure

### Dashboard Appointment List
- Context provider: `src/app/(app)/contexts/group-context.tsx`
- List component: `src/app/(app)/dashboard/components/AppointmentList.tsx`
- Card component: `src/app/(app)/dashboard/components/AppointmentCard.tsx`
- Filters: `PeriodFilter.tsx`, `TypeFilter.tsx`
- Hook: `src/hooks/useInfiniteScroll.ts`

### Appointment Creation
- Route layout: `src/app/(app-plain)/dashboard/appointments/create/layout.tsx`
- Context provider: `src/app/(app-plain)/dashboard/appointments/create/create-appointment-context.tsx`
- Step UI: `src/app/(app-plain)/dashboard/appointments/create/steps/*`

## Server Actions
- `listAppointmentsAction`: cursor-based pagination with period/type filters
- `createAppointmentAction`
- `sendAppointmentInvitationAction`

## Schema
- Zod schemas in `src/schemas/appointment.ts`

## Dashboard List Features
- **GroupContext**: Shared state between TopNav and Dashboard for group selection
- **Filters**:
  - Period: `today` | `week` | `month` | `all`
  - Type: `all` | `created` | `joined`
- **Pagination**: Cursor-based, 10 items per page, IntersectionObserver infinite scroll
- **AppointmentCard**:
  - Status badge: confirmed (green #339B31), pending (orange #E75D2C), canceled (red #C5371E)
  - Place info: name, address, category
  - DateTime: formatted date (월일 요일) + time range (오전/오후)
  - Participant info: "me" badge, host name, member count
  - Edit button: visible only for owner (isOwner)

## Create Flow Behavior
- Title can be duplicated
- Date uses native date input
- Start/end time inputs are separate
- Place search uses Kakao REST API (server action)
- Optional current location sorting (radius 5km) when permission granted
- Selected place shows Kakao map preview + info window
