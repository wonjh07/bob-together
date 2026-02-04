# FLOWS

## Group Flow

### Routes
- `/group`
- `/group/join`
- `/group/join/confirm`
- `/group/join/complete`
- `/group/create`
- `/group/create/complete`
- `/group/invitation`
- `/group/invitation/complete`

### Shared Styles
- `src/app/(onboarding)/group/shared.css.ts`

---

## Appointment Flow

### Routes
- `/dashboard`
- `/dashboard/appointments/create`
- `/dashboard/appointments/invitation`
- `/dashboard/appointments/invitation/complete`

### Entry Points
- Dashboard list: `src/app/(app)/dashboard/page.tsx`
- Appointment list UI: `src/app/(app)/dashboard/components/AppointmentList.tsx`
- Create flow UI: `src/app/(app-plain)/dashboard/appointments/create/page.tsx`
- Create flow layout: `src/app/(app-plain)/dashboard/appointments/create/layout.tsx`

### Schemas
- `src/schemas/appointment.ts`

### Create Flow Notes
- Date/time split inputs
- Place search via Kakao REST API
- Optional current-location sorting (radius 5km)
- Selected place shows map preview
