# FLOWS

## Group Flow

### Routes -> Files
- `/group` -> `src/app/(onboarding)/group/page.tsx`
- `/group/join` -> `src/app/(onboarding)/group/join/page.tsx`
- `/group/join/confirm` -> `src/app/(onboarding)/group/join/confirm/page.tsx`
- `/group/join/complete` -> `src/app/(onboarding)/group/join/complete/page.tsx`
- `/group/create` -> `src/app/(onboarding)/group/create/page.tsx`
- `/group/create/complete` -> `src/app/(onboarding)/group/create/complete/page.tsx`
- `/group/invitation` -> `src/app/(onboarding)/group/invitation/page.tsx`
- `/group/invitation/complete` -> `src/app/(onboarding)/group/invitation/complete/page.tsx`

### Shared Styles
- `src/app/(onboarding)/group/shared.css.ts`

### Actions/Rules
- 상세는 `ai_docs/ACTIONS.md`, `ai_docs/ERRORS_AND_LESSONS.md` 참고

---

## Appointment Flow

### Routes -> Files
- `/dashboard` -> `src/app/dashboard/(nav)/page.tsx`
- `/dashboard/appointments/create` -> `src/app/dashboard/(plain)/appointments/create/page.tsx`
- `/dashboard/appointments/invitation` -> `src/app/dashboard/(plain)/appointments/invitation/page.tsx`
- `/dashboard/appointments/invitation/complete` -> `src/app/dashboard/(plain)/appointments/invitation/complete/page.tsx`

### Key UI Entry Points
- Appointment list UI: `src/app/dashboard/_components/AppointmentList.tsx`
- Create multi-step: `src/app/dashboard/(plain)/appointments/create/MultiStepFormClient.tsx`

### Schemas
- `src/schemas/appointment.ts`

### External Integrations
- Kakao Map/Place search: `ai_docs/KAKAO_INTEGRATION.md`
