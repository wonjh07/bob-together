# E2E Scenarios (Current Project Baseline)

## 목적
- 현재 코드 기준 사용자 End-to-End(인증, 그룹, 약속, 초대, 알림, 리뷰) 시나리오를 단일 문서로 정리한다.

## 범위
- 라우트 기준: `src/app/(onboarding)/**`, `src/app/dashboard/**`
- 액션 기준: `src/actions/auth/**`, `src/actions/group/**`, `src/actions/appointment/**`, `src/actions/invitation/**`
- 문서 기준일: 2026-02-25

## 공통 전제
- 비로그인 사용자가 보호 경로 접근 시 `/login?redirect=<path>`로 이동한다 (`src/middleware.ts`).
- 사용자가 그룹이 0개이면 `/dashboard` 진입 시 `/group`으로 리다이렉트된다 (`src/app/dashboard/(nav)/page.tsx`).
- 온보딩의 그룹 실사용 진입은 현재 `/group` 단일 페이지다 (`src/app/(onboarding)/group/page.tsx`).

## 시나리오

### E2E-01 신규 사용자 가입 후 첫 그룹 생성
- 시작: `/signup`
- 경로:
1. 가입 (`signupAction`)
2. 로그인 (`loginAction`)
3. `/dashboard` 진입
4. 그룹 미보유이므로 `/group` 이동
5. `그룹 생성하기` 클릭 후 `/dashboard/profile/groups/create`
6. 그룹 생성 제출 (`createGroupAction`)
7. `/dashboard/profile/groups/[groupId]/members` 이동
- 완료 기준:
  - `groups`, `group_members`에 생성자 데이터가 반영된다.
  - 그룹 멤버 페이지에서 본인(`me`) 표기가 보인다.

### E2E-02 기존 사용자의 그룹 탐색/가입
- 시작: `/dashboard/profile/groups/find`
- 경로:
1. 그룹명 검색 (`searchGroupsWithCountAction`)
2. `가입하기` 클릭 (`joinGroupAction`)
3. 그룹 관리/대시보드 캐시 무효화 (`invalidateGroupMembershipQueries`)
- 완료 기준:
  - 버튼 상태가 `가입 완료`로 전환된다.
  - 그룹 관리 화면에서 가입 그룹이 노출된다.

### E2E-03 그룹 멤버 초대와 초대 수락
- 발송자 시작: `/dashboard/profile/groups/[groupId]/members/invitation`
- 발송자 경로:
1. 사용자 검색 (`searchGroupInvitableUsersAction`)
2. 초대 전송 (`sendGroupInvitationAction`)
- 수신자 시작: `/dashboard/notifications`
- 수신자 경로:
1. 알림 목록 조회 (`listReceivedInvitationsAction`)
2. 수락/거절 (`respondToInvitationAction`)
- 완료 기준:
  - 수락 시 `group_members`에 멤버가 추가된다.
  - 알림 카드 상태가 `초대 수락` 또는 `초대 거절`로 유지된다.

### E2E-04 약속 생성 후 멤버 초대
- 시작: `/dashboard/appointments/create`
- 경로:
1. 그룹/제목/일시/장소 입력
2. 생성 제출 (`createAppointmentAction`)
3. 완료 단계에서 `멤버 초대하기` 클릭
4. `/dashboard/appointments/invitation?appointmentId=...`
5. 사용자 검색 (`searchAppointmentInvitableUsersAction`)
6. 초대 전송 (`sendAppointmentInvitationAction`)
- 완료 기준:
  - `appointments`, `appointment_members(owner)`가 생성된다.
  - 초대 상태 조회(`getAppointmentInvitationStateAction`)에 pending 대상이 반영된다.

### E2E-05 약속 초대 수락 후 참여/댓글
- 시작: 수신자 `/dashboard/notifications`
- 경로:
1. 약속 초대 수락 (`respondToInvitationAction`)
2. 약속 상세 이동 `/dashboard/appointments/[appointmentId]`
3. 필요 시 `참여하기`/`나가기` (`joinAppointmentAction`, `leaveAppointmentAction`)
4. 댓글 작성/수정/삭제 (`create/update/deleteAppointmentCommentAction`)
- 완료 기준:
  - 수락 시 `appointment_members`에 멤버가 추가된다.
  - 댓글 수/목록과 `내 댓글` 목록이 동기화된다.

### E2E-06 종료 약속 리뷰 작성
- 시작: `/dashboard/profile/reviews/waitlist` 또는 `/dashboard/profile/history`
- 경로:
1. 리뷰 대상 조회 (`listReviewableAppointmentsAction`, `listAppointmentHistoryAction`)
2. 리뷰 작성/수정 (`submitPlaceReviewAction`)
3. 필요 시 삭제 (`deleteMyReviewAction`)
- 완료 기준:
  - 종료된 참여 약속 기준으로 리뷰 작성 가능 여부가 일관되게 동작한다.
  - `내 리뷰` 목록에 최신 상태가 반영된다.

