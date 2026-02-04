# CODEMAP

## 디렉토리별 책임
- `src/app`: Next.js App Router 페이지/레이아웃
- `src/actions`: Server Actions
- `src/provider`: Context/Provider
- `src/components`: 공용 UI/도메인 컴포넌트
- `src/hooks`: 공용 훅
- `src/libs`: 외부 서비스 클라이언트 및 서버 전용 유틸
- `src/styles`: 디자인 토큰/테마

## 핵심 엔트리 포인트
- `src/app/(app)/layout.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app-plain)/dashboard/appointments/create/page.tsx`
- `src/app/(onboarding)/layout.tsx`

## 자주 건드리는 파일 TOP 10
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/components/topNav.tsx`
- `src/app/(app)/dashboard/components/AppointmentList.tsx`
- `src/app/(app-plain)/dashboard/appointments/create/page.tsx`
- `src/provider/group-provider.tsx`
- `src/provider/create-appointment-context.tsx`
- `src/actions/group.ts`
- `src/actions/appointment.ts`
- `src/components/kakao/KakaoMapPreview.tsx`
- `src/styles/theme.css.ts`

## Routes Index

### Onboarding
- `/login` -> `src/app/(onboarding)/login/page.tsx`
- `/signup` -> `src/app/(onboarding)/signup/page.tsx`
- `/signup/success` -> `src/app/(onboarding)/signup/success/page.tsx`

### Group Flow (Onboarding)
- `/group` -> `src/app/(onboarding)/group/page.tsx`
- `/group/join` -> `src/app/(onboarding)/group/join/page.tsx`
- `/group/join/confirm` -> `src/app/(onboarding)/group/join/confirm/page.tsx`
- `/group/join/complete` -> `src/app/(onboarding)/group/join/complete/page.tsx`
- `/group/create` -> `src/app/(onboarding)/group/create/page.tsx`
- `/group/create/complete` -> `src/app/(onboarding)/group/create/complete/page.tsx`
- `/group/invitation` -> `src/app/(onboarding)/group/invitation/page.tsx`
- `/group/invitation/complete` -> `src/app/(onboarding)/group/invitation/complete/page.tsx`

### App Shell
- `/dashboard` -> `src/app/(app)/dashboard/page.tsx`
- `/dashboard/profile` -> `src/app/(app)/dashboard/profile/`
- `/dashboard/search` -> `src/app/(app)/dashboard/search/`
- App layout -> `src/app/(app)/layout.tsx`

#### Dashboard Components
- GroupProvider -> `src/provider/group-provider.tsx`
- AppointmentList -> `src/app/(app)/dashboard/components/AppointmentList.tsx`

### App Plain
- Plain layout -> `src/app/(app-plain)/dashboard/layout.tsx`

#### Appointments
- `/dashboard/appointments/create` -> `src/app/(app-plain)/dashboard/appointments/create/page.tsx`
- `/dashboard/appointments/create` layout -> `src/app/(app-plain)/dashboard/appointments/create/layout.tsx`
- `/dashboard/appointments/invitation` -> `src/app/(app-plain)/dashboard/appointments/invitation/page.tsx`
- `/dashboard/appointments/invitation/complete` -> `src/app/(app-plain)/dashboard/appointments/invitation/complete/page.tsx`

#### Appointment Create Steps
- GroupStep -> `src/app/(app-plain)/dashboard/appointments/create/components/GroupStep.tsx`
- TitleStep -> `src/app/(app-plain)/dashboard/appointments/create/components/TitleStep.tsx`
- DateTimeStep -> `src/app/(app-plain)/dashboard/appointments/create/components/DateTimeStep.tsx`
- PlaceStep -> `src/app/(app-plain)/dashboard/appointments/create/components/PlaceStep.tsx`
- ConfirmStep -> `src/app/(app-plain)/dashboard/appointments/create/components/ConfirmStep.tsx`
- CompleteStep -> `src/app/(app-plain)/dashboard/appointments/create/components/CompleteStep.tsx`
