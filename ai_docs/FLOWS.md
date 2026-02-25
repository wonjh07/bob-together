# FLOWS

## Group Flow

### Routes -> Files
- `/group` -> `src/app/(onboarding)/group/page.tsx`
- `/dashboard/profile/groups` -> `src/app/dashboard/(plain)/profile/groups/page.tsx`
- `/dashboard/profile/groups/create` -> `src/app/dashboard/(plain)/profile/groups/create/page.tsx`
- `/dashboard/profile/groups/find` -> `src/app/dashboard/(plain)/profile/groups/find/page.tsx`
- `/dashboard/profile/groups/[groupId]/members` -> `src/app/dashboard/(plain)/profile/groups/[groupId]/members/page.tsx`
- `/dashboard/profile/groups/[groupId]/members/invitation` -> `src/app/dashboard/(plain)/profile/groups/[groupId]/members/invitation/page.tsx`

### Entry Rules
- 온보딩 그룹 진입(`/group`)에서는 버튼 링크로 대시보드 그룹 생성/검색 페이지로 이동
- 그룹 생성/가입/초대의 기준 UI는 `dashboard/profile/groups/**` 도메인에서 관리

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
- `/dashboard/places/[placeId]` -> `src/app/dashboard/(plain)/places/[placeId]/page.tsx`
- `/dashboard/notifications` -> `src/app/dashboard/(plain)/notifications/page.tsx`
- `/dashboard/profile/history` -> `src/app/dashboard/(plain)/profile/history/page.tsx`
- `/dashboard/profile/reviews` -> `src/app/dashboard/(plain)/profile/reviews/page.tsx`
- `/dashboard/profile/reviews/[appointmentId]` -> `src/app/dashboard/(plain)/profile/reviews/[appointmentId]/page.tsx`
- `/dashboard/profile/comments` -> `src/app/dashboard/(plain)/profile/comments/page.tsx`

### Key UI Entry Points
- Appointment list UI: `src/app/dashboard/_components/AppointmentList.tsx`
- Create multi-step: `src/app/dashboard/(plain)/appointments/create/MultiStepFormClient.tsx`
- Detail actions UI: `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`

### Schemas
- `src/schemas/appointment.ts`

### External Integrations
- Kakao Map/Place search: `ai_docs/KAKAO_INTEGRATION.md`

### Detail Status Flow
- `pending`: `초대하기`
- `canceled`: 상태 변경 버튼 없음 (수정 화면에서 활성화)
- `ended`: 상태 변경 버튼 없음

### Invitation Flow
- `/dashboard/appointments/invitation`에서 `완료` 클릭 시 토스트(`약속 초대를 완료했습니다.`) 후 약속 상세로 이동
- `/dashboard/notifications`에서 받은 초대를 확인하고 `수락/거절` 처리
  - 그룹 초대 수락: 그룹 멤버로 등록
  - 약속 초대 수락: 약속 멤버로 등록(권한 조건 충족 시)
  - 응답 완료된 초대(`accepted`, `rejected`)는 리스트에 유지하고 상태 라벨로 표시
  - 종료된 약속 초대는 버튼을 숨기고 `종료된 약속입니다`로 표시

### Detail Comment Flow
- 상세 페이지 하단 댓글 섹션에서 댓글 목록/개수 조회
- 입력창에 댓글 작성 후 전송 버튼으로 등록
- 등록 성공 시 목록/개수를 화면에서 즉시 갱신
- 댓글 우측 점 버튼은 UI만 제공(로직 미구현)

### Edit Flow
- `/dashboard/appointments/[appointmentId]/edit`
  - 제목/날짜/시간 편집
  - `약속 취소하기` 버튼으로 상태를 `canceled`로 변경
  - `약속 활성화하기` 버튼으로 상태를 `pending`으로 변경(취소 상태일 때만)
  - `완료` 클릭 시 `updateAppointmentAction` 실행
- `/dashboard/appointments/[appointmentId]/edit/place`
  - 장소 검색/선택
  - 선택 결과를 edit 화면 쿼리로 전달해 최종 저장에 반영
