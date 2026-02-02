# Appointment Flow

## Routes
- `/dashboard/appointments/create`: appointment creation wizard
- `/dashboard/appointments/invitation`: invite members
- `/dashboard/appointments/invitation/complete`: invite complete

## Structure
- Route layout: `src/app/(app)/dashboard/appointments/create/layout.tsx`
- Context provider: `src/app/(app)/dashboard/appointments/create/create-appointment-context.tsx`
- Step UI: `src/app/(app)/dashboard/appointments/create/steps/*`

## Server Actions
- `createAppointmentAction`
- `sendAppointmentInvitationAction`

## Schema
- Zod schemas in `src/schemas/appointment.ts`

## Behavior
- Title can be duplicated
- Date uses native date input
- Start/end time inputs are separate
- Place search uses Kakao REST API (server action)
- Optional current location sorting (radius 5km) when permission granted
- Selected place shows Kakao map preview + info window
