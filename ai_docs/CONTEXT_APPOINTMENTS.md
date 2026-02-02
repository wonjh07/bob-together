# Appointment Flow

## Routes
- `/dashboard/appointments/create`: appointment creation wizard
- `/dashboard/appointments/invitation`: invite members
- `/dashboard/appointments/invitation/complete`: invite complete

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
- Selected place shows Kakao map preview + info window
