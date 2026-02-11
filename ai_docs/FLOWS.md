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
- `/dashboard/appointments/[appointmentId]` -> `src/app/dashboard/(plain)/appointments/[appointmentId]/page.tsx`
- `/dashboard/appointments/[appointmentId]/edit` -> `src/app/dashboard/(plain)/appointments/[appointmentId]/edit/page.tsx`
- `/dashboard/appointments/[appointmentId]/edit/place` -> `src/app/dashboard/(plain)/appointments/[appointmentId]/edit/place/page.tsx`
- `/dashboard/appointments/[appointmentId]/members` -> `src/app/dashboard/(plain)/appointments/[appointmentId]/members/page.tsx`
- `/dashboard/appointments/invitation` -> `src/app/dashboard/(plain)/appointments/invitation/page.tsx`
- `/dashboard/appointments/invitation/complete` -> `src/app/dashboard/(plain)/appointments/invitation/complete/page.tsx`

### Key UI Entry Points
- Appointment list UI: `src/app/dashboard/_components/AppointmentList.tsx`
- Create multi-step: `src/app/dashboard/(plain)/appointments/create/MultiStepFormClient.tsx`
- Detail actions UI: `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`

### Schemas
- `src/schemas/appointment.ts`

### External Integrations
- Kakao Map/Place search: `ai_docs/KAKAO_INTEGRATION.md`

### Detail Status Flow
- `pending`: `초대하기` + `확정하기` + `취소하기`
- `confirmed`: `초대하기` + `확정 취소` + `취소하기`
- `canceled`: `약속 활성화하기`

### Detail Comment Flow
- 상세 페이지 하단 댓글 섹션에서 댓글 목록/개수 조회
- 입력창에 댓글 작성 후 전송 버튼으로 등록
- 등록 성공 시 목록/개수를 화면에서 즉시 갱신
- 댓글 우측 점 버튼은 UI만 제공(로직 미구현)

### Edit Flow
- `/dashboard/appointments/[appointmentId]/edit`
  - 제목/날짜/시간 편집
  - `완료` 클릭 시 `updateAppointmentAction` 실행
- `/dashboard/appointments/[appointmentId]/edit/place`
  - 장소 검색/선택
  - 선택 결과를 edit 화면 쿼리로 전달해 최종 저장에 반영
