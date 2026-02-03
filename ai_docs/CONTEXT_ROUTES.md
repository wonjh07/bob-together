# Routes Index

## Onboarding
- `/login` -> `src/app/(onboarding)/login/page.tsx`
- `/signup` -> `src/app/(onboarding)/signup/page.tsx`
- `/signup/success` -> `src/app/(onboarding)/signup/success/page.tsx`

## Group Flow (Onboarding)
- `/group` -> `src/app/(onboarding)/group/page.tsx`
- `/group/join` -> `src/app/(onboarding)/group/join/page.tsx`
- `/group/join/confirm` -> `src/app/(onboarding)/group/join/confirm/page.tsx`
- `/group/join/complete` -> `src/app/(onboarding)/group/join/complete/page.tsx`
- `/group/create` -> `src/app/(onboarding)/group/create/page.tsx`
- `/group/create/complete` -> `src/app/(onboarding)/group/create/complete/page.tsx`
- `/group/invitation` -> `src/app/(onboarding)/group/invitation/page.tsx`
- `/group/invitation/complete` -> `src/app/(onboarding)/group/invitation/complete/page.tsx`

## App Shell (with TopNav)
- `/dashboard` -> `src/app/(app)/dashboard/page.tsx`
- `/dashboard/profile` -> `src/app/(app)/dashboard/profile/`
- `/dashboard/search` -> `src/app/(app)/dashboard/search/`
- App layout -> `src/app/(app)/layout.tsx`

### Dashboard Components
- GroupContext -> `src/app/(app)/contexts/group-context.tsx`
- AppointmentList -> `src/app/(app)/dashboard/components/AppointmentList.tsx`
- AppointmentCard -> `src/app/(app)/dashboard/components/AppointmentCard.tsx`
- PeriodFilter -> `src/app/(app)/dashboard/components/PeriodFilter.tsx`
- TypeFilter -> `src/app/(app)/dashboard/components/TypeFilter.tsx`

### Shared Hooks
- useInfiniteScroll -> `src/hooks/useInfiniteScroll.ts`

## App Plain (step-based flows, no TopNav)
- Plain layout -> `src/app/(app-plain)/dashboard/layout.tsx`

### Appointments
- `/dashboard/appointments/create` -> `src/app/(app-plain)/dashboard/appointments/create/page.tsx`
- `/dashboard/appointments/create` layout -> `src/app/(app-plain)/dashboard/appointments/create/layout.tsx`
- `/dashboard/appointments/invitation` -> `src/app/(app-plain)/dashboard/appointments/invitation/page.tsx`
- `/dashboard/appointments/invitation/complete` -> `src/app/(app-plain)/dashboard/appointments/invitation/complete/page.tsx`

### Appointment Create Steps
- TitleStep -> `src/app/(app-plain)/dashboard/appointments/create/steps/TitleStep.tsx`
- DateTimeStep -> `src/app/(app-plain)/dashboard/appointments/create/steps/DateTimeStep.tsx`
- PlaceStep -> `src/app/(app-plain)/dashboard/appointments/create/steps/PlaceStep.tsx`
- ConfirmStep -> `src/app/(app-plain)/dashboard/appointments/create/steps/ConfirmStep.tsx`
- CompleteStep -> `src/app/(app-plain)/dashboard/appointments/create/steps/CompleteStep.tsx`
