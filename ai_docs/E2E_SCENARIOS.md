# E2E Scenarios (Current Project Baseline)

## 목적
- 현재 코드 기준 사용자 End-to-End(인증, 그룹, 약속, 초대, 알림, 리뷰) 시나리오를 단일 문서로 정리한다.
- 비즈니스 로직/UX 관점의 위험 구간을 식별하고 수정 계획 우선순위를 제시한다.

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

## 비즈니스 로직/UX 리스크 및 수정 계획

### RISK-01 로그인 후 원래 목적지 복귀 불가 (P0, Resolved 2026-02-25)
- 근거:
  - 미들웨어는 `/login?redirect=...`를 설정한다 (`src/middleware.ts`).
  - (변경 전) 로그인 성공 후 항상 `/dashboard`로 이동했다.
- 영향:
  - 보호 경로 딥링크 진입 사용자의 흐름이 끊긴다.
  - 초대/상세 페이지로 바로 진입하려던 전환율이 저하될 수 있다.
- 수정 계획:
1. 로그인 폼에서 `redirect` 쿼리를 읽어 성공 시 `router.replace(redirect || '/dashboard')` 적용.
2. 외부 URL 오픈 리다이렉트 방지를 위해 상대 경로만 허용.
3. 로그인 폼 테스트에 `redirect` 파라미터 케이스 추가.
- 상태:
  - `resolveLoginRedirectPath` + `router.replace(...)` 적용 완료
  - `redirect.test.ts`로 상대 경로만 허용하는 케이스 검증 완료

### RISK-02 종료/취소 약속 초대가 서버에서 차단되지 않음 (P0, Resolved 2026-02-25)
- 근거:
  - (변경 전) `sendAppointmentInvitationAction`은 약속 조회 시 `status`, `ends_at` 검증이 없었다.
  - UI에서는 버튼만 숨기고 있어 API 직접 호출 우회가 가능하다.
- 영향:
  - 수락 불가능한 pending 초대가 생성되어 알림 신뢰도가 떨어진다.
  - 운영 데이터 정합성(유효하지 않은 초대) 리스크가 생긴다.
- 수정 계획:
1. 초대 발송 액션에 `status`, `ends_at` 조회 추가.
2. `canceled` 또는 time-ended이면 `forbidden` 반환.
3. 액션 테스트에 종료/취소 케이스 추가.
- 상태:
  - `sendAppointmentInvitationAction` 서버 검증 반영 완료
  - `invite.test.ts`에 종료/취소 거절 케이스 추가 완료

### RISK-03 초대 검색 결과가 실제 초대 가능 대상과 불일치 (P1, Resolved 2026-02-25)
- 근거:
  - (변경 전) 그룹/약속 초대 화면이 공통 `searchUsersAction`을 사용해 전체 사용자 검색 결과를 노출했다.
  - 약속 초대는 그룹 비멤버를 눌러야 실패를 알 수 있다.
- 영향:
  - 불필요한 실패 클릭이 많고 사용자 피로가 증가한다.
  - 초대 성공률 저하 및 서버 호출 낭비가 발생한다.
- 수정 계획:
1. `searchAppointmentInvitableUsersAction(appointmentId, query)` 도입.
2. `searchGroupInvitableUsersAction(groupId, query)` 도입.
3. 검색 결과를 `초대 가능/이미 멤버/이미 pending` 상태로 즉시 표시.
- 상태:
  - 약속 초대 검색은 `searchAppointmentInvitableUsersAction`으로 전환 완료
  - 그룹 초대 검색은 `searchGroupInvitableUsersAction`으로 전환 완료
  - pending 초대 대상도 검색 결과에 노출되고 UI에서 `초대 완료`로 표시

### RISK-04 레거시 온보딩 그룹 join 경로 단절 가능성 (P1, Closed 2026-02-25)
- 근거:
  - `/group/join*` 라우트 파일이 현재 코드에 존재하지 않는다.
  - 과거 문서/북마크/외부 링크가 남아 있으면 404 가능성이 있다.
- 영향:
  - 기존 유입 링크에서 이탈이 발생할 수 있다.
- 수정 계획:
1. 레거시 경로 미지원 정책 유지.
2. 레거시 관련 코드/문서 참조를 제거해 유지보수 대상에서 제외.
- 상태:
  - 레거시 `/group/join*` 페이지 및 관련 코드 제거 완료(현재 미지원)

### RISK-05 멤버 목록의 `⋮` 버튼이 동작 없는 placeholder (P2)
- 근거:
  - 그룹/약속 멤버 목록 화면에 메뉴 버튼이 있으나 실제 액션 연결이 없다.
  - 대상 파일: `src/app/dashboard/(plain)/profile/groups/[groupId]/members/page.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/members/page.tsx`
- 영향:
  - 사용자가 기능이 있다고 오해하고 혼란을 겪는다.
- 수정 계획:
1. 기능 확정 전까지 버튼 숨김 처리 또는 disabled + 안내 문구 제공.
2. 이후 기능 범위(권한 변경/강퇴 등) 확정 시 `OverflowMenu` 기반으로 구현.

## 실행 우선순위
1. 잔여 과제: RISK-05
2. 완료: RISK-01, RISK-02, RISK-03, RISK-04

## QA 체크리스트 (수정 후)
- 로그인 redirect 파라미터 기반 복귀 동작 확인.
- 종료/취소 약속 초대 API가 서버에서 거절되는지 확인.
- 초대 검색 결과와 실제 초대 가능 조건이 일치하는지 확인.
- 그룹 초대 검색에서 pending 초대 대상이 결과에 보이고 `초대 완료`로 표시되는지 확인.
- 약속 초대 검색에서 pending 초대 대상이 결과에 보이고 `초대 완료`로 표시되는지 확인.
