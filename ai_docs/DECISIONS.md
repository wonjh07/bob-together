# DECISIONS

## 약속 멤버 목록 조회 권한을 그룹 멤버 기준으로 변경 (2026-02-26)
- Decision: `get_appointment_members_with_count` 접근 권한을 "약속 멤버"가 아닌 "해당 약속의 그룹 멤버" 기준으로 변경한다.
- Alternatives: 기존처럼 `appointment_members` 포함 사용자만 조회 허용
- Reason: 서비스 정책상 약속 참여 여부와 무관하게 같은 그룹 구성원은 약속 멤버 목록을 확인할 수 있어야 하기 때문
- Scope:
  - `supabase/migrations/20260226039000_allow_group_members_get_appointment_members_rpc.sql`
  - `src/actions/appointment/[appointmentId]/members/get.test.ts`

## 약속 생성 액션 단일 RPC화 (2026-02-26)
- Decision: `createAppointmentAction`의 다중 DB 호출(기본 그룹 조회 + 생성 RPC)을 단일 RPC 호출로 단순화한다.
- Alternatives: 액션에서 `group_members` 선조회 후 RPC 호출 유지
- Reason: 액션 책임을 입력 검증 + 인증 + 단일 RPC 매핑으로 제한하고, 기본 그룹 선택 규칙을 DB 함수에 고정해 일관성을 높이기 위함
- Scope:
  - `supabase/migrations/20260226038000_create_appointment_with_owner_member_default_group_rpc.sql`
  - `src/actions/appointment/create.ts`
  - `src/actions/appointment/create.test.ts`

## 내 리뷰 삭제 액션 RPC 전환 (2026-02-26)
- Decision: `deleteMyReviewAction`의 다중 쿼리(기존 리뷰 조회 + null 업데이트)를 단일 RPC(`delete_my_review_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `user_review` 순차 조회/업데이트 유지
- Reason: 리뷰 존재/내용 판정과 삭제 업데이트를 DB 함수로 고정해 액션 책임을 단순화하고 상태경합 가능성을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226037000_delete_my_review_transaction_rpc.sql`
  - `src/actions/appointment/review/delete.ts`
  - `src/actions/appointment/review/delete.test.ts`

## 약속 댓글 목록 조회 액션 RPC 전환 (2026-02-26)
- Decision: `getAppointmentCommentsAction`의 다중 조회 쿼리(접근 확인 + 댓글 목록/count)를 단일 RPC(`get_appointment_comments_with_cursor`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments` + `appointment_comments` 순차 조회 유지
- Reason: 키셋 커서/카운트/접근 검증 규칙을 DB 함수에 고정해 액션 책임을 단순화하고 조회 경로를 일관화하기 위함
- Scope:
  - `supabase/migrations/20260226036000_get_appointment_comments_with_cursor_rpc.sql`
  - `src/actions/appointment/[appointmentId]/comments/list.ts`
  - `src/actions/appointment/[appointmentId]/comments/list.test.ts`

## 그룹 멤버 조회 액션 RPC 전환 (2026-02-26)
- Decision: `getGroupMembersAction`의 다중 조회 쿼리(멤버십 접근 확인 + 멤버 목록/카운트)를 단일 RPC(`get_group_members_with_count`) 호출로 전환한다.
- Alternatives: 액션 내 `group_members` 순차 조회 유지
- Reason: 접근 검증과 멤버 집계를 DB 함수로 고정해 액션 책임을 단순화하고 조회 로직을 일관화하기 위함
- Scope:
  - `supabase/migrations/20260226035000_get_group_members_with_count_rpc.sql`
  - `src/actions/group/getGroupMembersAction.ts`
  - `src/actions/group/getGroupMembersAction.test.ts`

## 약속 멤버 조회 액션 RPC 전환 (2026-02-26)
- Decision: `getAppointmentMembersAction`의 다중 조회 쿼리(접근 확인 + 멤버 목록/카운트)를 단일 RPC(`get_appointment_members_with_count`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments`/`appointment_members` 순차 조회 유지
- Reason: 접근 검증과 멤버 집계 로직을 DB 함수에 고정해 액션 책임을 단순화하고 조회 경로를 일관화하기 위함
- Scope:
  - `supabase/migrations/20260226034000_get_appointment_members_with_count_rpc.sql`
  - `src/actions/appointment/[appointmentId]/members/get.ts`
  - `src/actions/appointment/[appointmentId]/members/get.test.ts`

## 약속 나가기 액션 RPC 전환 (2026-02-26)
- Decision: `leaveAppointmentAction`의 다중 쿼리(약속 상태 조회 + 멤버 삭제)를 단일 RPC(`leave_appointment_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments` 조회 후 `appointment_members delete` 순차 쿼리 유지
- Reason: 작성자/취소/종료 상태 검증과 멤버 삭제를 DB 함수로 원자화해 액션 책임을 단순화하고 상태경합을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226033000_leave_appointment_transaction_rpc.sql`
  - `src/actions/appointment/[appointmentId]/members/leave.ts`
  - `src/actions/appointment/[appointmentId]/members/leave.test.ts`

## 약속 상태 변경 액션 RPC 전환 (2026-02-26)
- Decision: `updateAppointmentStatusAction`의 다중 쿼리(약속 조회 + 상태 update)를 단일 RPC(`update_appointment_status_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments` 조회/업데이트를 순차 쿼리로 유지
- Reason: 작성자 권한/종료 여부/상태 갱신을 트랜잭션 함수로 고정해 액션 책임을 단순화하고 상태경합을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226032000_update_appointment_status_transaction_rpc.sql`
  - `src/actions/appointment/[appointmentId]/updateStatus.ts`
  - `src/actions/appointment/[appointmentId]/updateStatus.test.ts`

## 그룹 탈퇴 액션 RPC 전환 (2026-02-26)
- Decision: `leaveGroupAction`의 다중 쿼리(멤버십 조회 + 삭제) 경로를 단일 RPC(`leave_group_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `group_members` 조회/삭제를 순차 쿼리로 유지
- Reason: 권한/역할 검증과 삭제를 DB 함수로 고정해 액션 로직을 단순화하고 상태경합 가능성을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226031000_leave_group_transaction_rpc.sql`
  - `src/actions/group/leaveGroupAction.ts`
  - `src/actions/group/leaveGroupAction.test.ts`

## 프로필 이미지 DB 갱신 RPC 전환 (2026-02-26)
- Decision: 프로필 이미지 삭제/변경 액션의 DB 갱신 경로를 다중 테이블 쿼리(select + update)에서 액션당 단일 RPC로 전환한다.
- Alternatives: 기존처럼 액션에서 `users` select/update를 직접 수행
- Reason: 액션 책임을 인증/스토리지 처리 + 단일 RPC 호출로 단순화하고, DB 갱신 경로의 원자성과 규칙을 함수로 고정하기 위함
- Scope:
  - `supabase/migrations/20260226029000_clear_user_profile_image_transaction_rpc.sql`
  - `supabase/migrations/20260226030000_set_user_profile_image_transaction_rpc.sql`
  - `src/actions/user/deleteProfileImageAction.ts`
  - `src/actions/user/uploadProfileImageAction.ts`

## User 액션 인증 에러 코드 단일화 (2026-02-26)
- Decision: user 도메인 액션의 인증 실패 코드는 `user-not-found` 대신 공용 가드의 `unauthorized`로 통일한다.
- Alternatives: user 액션에서만 `user-not-found`를 별도 유지
- Reason: 인증 실패 의미를 액션 도메인마다 다르게 표현할 필요가 없고, 공용 가드로 표준화 시 분기/테스트 복잡도를 줄일 수 있기 때문
- Scope:
  - `src/actions/user/getUserData.ts`
  - `src/actions/user/updateProfileAction.ts`
  - `src/actions/user/deleteProfileImageAction.ts`
  - `src/actions/user/uploadProfileImageAction.ts`
  - `src/types/result.ts`
  - user action tests 3건

## 그룹 액션 인증 가드 공통화 (2026-02-26)
- Decision: 그룹 도메인 액션의 인증 확인 로직은 직접 `auth.getUser()`를 호출하지 않고 `requireUser()` 공용 가드를 사용한다.
- Alternatives: 각 액션에서 `createSupabaseServerClient + auth.getUser` 중복 구현 유지
- Reason: 인증 에러 처리 규칙을 한 곳으로 수렴해 코드 중복과 분기 드리프트를 줄이기 위함
- Scope:
  - `src/actions/group/getMyGroupsAction.ts`
  - `src/actions/group/searchUsersAction.ts`
  - `src/actions/group/getGroupMembersAction.ts`
  - `src/actions/group/leaveGroupAction.ts`
  - `src/actions/group/searchGroupsWithCountAction.ts`
  - `src/actions/group/listMyGroupsWithStatsAction.ts`

## React Query 사용자 스코프 키 도입 (2026-02-26)
- Decision: React Query 키에 `query scope`(예: `user:{userId}`)를 선택적으로 부여해 사용자 단위로 캐시를 분리한다.
- Alternatives: 인증 이벤트에서 전역 `queryClient.clear()`에만 의존
- Reason: 로그인/계정 전환/새로고침 경로에서 쿼리 키 자체가 분리되도록 만들어 교차 계정 캐시 노출 리스크를 구조적으로 줄이기 위함
- Scope:
  - `src/libs/query/queryScope.ts`
  - `src/provider/query-scope-provider.tsx`
  - `src/app/providers.tsx`
  - `src/app/layout.tsx`
  - `src/libs/query/*Keys.ts`, `src/libs/query/*Queries.ts`
  - dashboard/profile/search/detail 관련 query option 호출부 및 SSR prefetch 페이지

## Auth 이벤트 캐시 초기화 조건 보정 (2026-02-26)
- Decision: 전역 Query 캐시 초기화는 `SIGNED_OUT`는 즉시 수행하고, `SIGNED_IN`은 초기 세션 복원이 아닌 **실제 계정 전환 시점**에만 수행한다.
- Alternatives: 기존처럼 `SIGNED_IN`/`SIGNED_OUT` 모두 무조건 `queryClient.clear()`
- Reason: 새로고침/초기 세션 복원에서도 `SIGNED_IN`이 발생할 수 있어, 무조건 clear 시 무한스크롤 페이지가 빈 상태로 보이는 회귀가 발생하기 때문
- Scope: `src/app/providers.tsx`

## 약속 초대 전송 RPC 통합 (2026-02-26)
- Decision: `sendAppointmentInvitationAction`의 다중 검증/insert 흐름을 RPC(`send_appointment_invitation_transactional`) 단일 호출로 통합한다.
- Alternatives: 기존 액션에서 약속/멤버/그룹멤버/초대 중복을 순차 다중 쿼리로 검증 후 insert
- Reason: 초대 전송 경로의 권한/중복/상태 검증을 DB 함수에 고정해 원자성과 일관성을 높이고, 액션 코드 복잡도를 줄이기 위함
- Scope: `supabase/migrations/20260226018000_send_appointment_invitation_transaction_rpc.sql`, `src/actions/appointment/[appointmentId]/members/invite.ts`, `src/actions/appointment/[appointmentId]/members/invite.test.ts`

## 3회 이상 DB 호출 액션 RPC 통합 (2026-02-26)
- Decision: 3회 이상 DB 호출을 수행하던 그룹/약속/리뷰 액션을 액션당 1개 RPC 호출 + 결과 매핑 구조로 전환한다.
- Alternatives: 기존 액션에서 순차 다중 쿼리(검증/검색/집계/쓰기) 유지
- Reason: 액션 책임을 최소화(입력검증/인증/단일 RPC 호출/매핑)하고, 중간 단계 실패에 따른 상태 불일치와 성능 편차를 줄이기 위함
- Scope:
  - Migrations:
    - `supabase/migrations/20260226019000_join_group_transaction_rpc.sql`
    - `supabase/migrations/20260226020000_create_group_transaction_rpc.sql`
    - `supabase/migrations/20260226021000_send_group_invitation_transaction_rpc.sql`
    - `supabase/migrations/20260226022000_search_group_invitable_users_transaction_rpc.sql`
    - `supabase/migrations/20260226023000_search_appointment_invitable_users_transaction_rpc.sql`
    - `supabase/migrations/20260226024000_join_appointment_transaction_rpc.sql`
    - `supabase/migrations/20260226025000_get_appointment_invitation_state_transaction_rpc.sql`
    - `supabase/migrations/20260226026000_update_appointment_transaction_rpc.sql`
    - `supabase/migrations/20260226027000_get_appointment_review_target_transaction_rpc.sql`
    - `supabase/migrations/20260226028000_submit_place_review_transaction_rpc.sql`
  - Actions:
    - `src/actions/group/joinGroupAction.ts`
    - `src/actions/group/createGroupAction.ts`
    - `src/actions/group/sendGroupInvitationAction.ts`
    - `src/actions/group/searchGroupInvitableUsersAction.ts`
    - `src/actions/appointment/[appointmentId]/members/searchInvitees.ts`
    - `src/actions/appointment/[appointmentId]/members/join.ts`
    - `src/actions/appointment/[appointmentId]/members/getInvitationState.ts`
    - `src/actions/appointment/[appointmentId]/update.ts`
    - `src/actions/appointment/review/getTarget.ts`
    - `src/actions/appointment/review/submit.ts`

## 받은 초대 목록 조회 RPC 통합 (2026-02-26)
- Decision: `listReceivedInvitationsAction` 조회를 액션 내 조인/커서 조건 쿼리에서 RPC(`list_received_invitations_with_cursor`) 호출로 통합한다.
- Alternatives: 기존 액션에서 `invitations + users/groups/appointments` 조인과 키셋 커서 조건 문자열(`or`)을 직접 조합
- Reason: 커서 조건/정렬/제한(`limit + 1`) 규칙을 DB 함수에 고정해 페이지네이션 안정성을 높이고, 액션 코드 복잡도를 줄이기 위함
- Scope: `supabase/migrations/20260226017000_list_received_invitations_with_cursor_rpc.sql`, `src/actions/invitation/listReceived.ts`, `src/actions/invitation/listReceived.test.ts`

## 내 댓글 조회 RPC 통합 (2026-02-26)
- Decision: `listMyCommentsAction` 조회를 액션 내 조인/커서 조건 쿼리에서 RPC(`list_my_comments_with_cursor`) 호출로 통합한다.
- Alternatives: 기존 액션에서 `appointment_comments + appointments` 조인과 키셋 커서 조건 문자열(`or`)을 직접 조합
- Reason: 커서 조건/정렬/제한(`limit + 1`) 규칙을 DB 함수에 고정해 페이지네이션 안정성을 높이고, 액션 코드 복잡도를 줄이기 위함
- Scope: `supabase/migrations/20260226016000_list_my_comments_with_cursor_rpc.sql`, `src/actions/appointment/comment/listMine.ts`, `src/actions/appointment/comment/listMine.test.ts`

## 약속 생성 원자성 보장 RPC 전환 (2026-02-26)
- Decision: 약속 생성 흐름을 앱 단의 다중 쿼리(`places upsert` → `appointments insert` → `appointment_members insert`)에서 DB RPC 단일 트랜잭션(`create_appointment_with_owner_member`) 호출로 전환한다.
- Alternatives: 현재 순차 쿼리 유지 + 실패 시 보상 삭제(수동 rollback)
- Reason: 중간 단계 실패 시 owner 멤버가 없는 orphan appointment가 남는 일관성 위험을 제거하고, 생성 경로를 원자적으로 보장하기 위함
- Scope: `supabase/migrations/20260226014000_create_appointment_with_owner_member_rpc.sql`, `src/actions/appointment/create.ts`

## 초대 응답 원자성 보장 RPC 전환 (2026-02-26)
- Decision: 초대 수락/거절 흐름을 앱 단의 다중 쿼리(멤버 insert + 초대 상태 update)에서 DB RPC 단일 트랜잭션(`respond_to_invitation_transactional`) 호출로 전환한다.
- Alternatives: 현재 순차 쿼리 유지 + 부분 실패 시 사후 보정
- Reason: 수락 중간 단계 실패 시 `멤버 반영됨 + 초대 pending` 불일치 상태를 제거하고, 응답 처리의 일관성을 보장하기 위함
- Scope: `supabase/migrations/20260226015000_respond_invitation_transaction_rpc.sql`, `src/actions/invitation/respond.ts`

## Template
- Decision:
- Alternatives:
- Reason:
- Scope:

## 대시보드 그룹 선택 위치 변경 (2026-02-04)
- Decision: 그룹 드롭다운을 TopNav에서 대시보드 상단으로 이동하고, 선택 상태를 쿠키에 저장하며, ai_docs를 정리
- Alternatives: TopNav 유지 + 전역 그룹 상태 유지, 문서는 부분 업데이트만 수행
- Reason: TopNav 의존성 축소, 대시보드 컨텍스트로 범위 제한, 사용자 선택 유지, 문서 중복 제거
- Scope: `src/app/**/dashboard/**`, `src/provider/group-provider.tsx`, `ai_docs/*`

## 대시보드 라우트 그룹 재구성 (2026-02-06)
- Decision: `(app)/(app-plain)`을 폐기하고 `src/app/dashboard/(nav)` / `(plain)`으로 통합
- Alternatives: 기존 `(app)`/`(app-plain)` 구조 유지
- Reason: 중복 폴더 구조 제거, 레이아웃 통합성 개선
- Scope: `src/app/dashboard/**`, `src/app/layout.tsx`

## User 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/user.ts` 단일 파일을 `src/actions/user/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `user.ts` 유지
- Reason: 프로필 관련 액션 증가로 책임 분리, 충돌 감소, 테스트/리뷰 범위 명확화
- Scope: `src/actions/user/*`, `src/actions/user.test.ts`

## Group 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/group.ts` 단일 파일을 `src/actions/group/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `group.ts` 유지
- Reason: 그룹 관련 액션 증가에 따른 파일 복잡도 축소, 책임 분리, 충돌 범위 최소화
- Scope: `src/actions/group/*`, `src/actions/group.ts`

## Appointment 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/appointment.ts` 단일 파일을 `src/actions/appointment/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `appointment.ts` 유지
- Reason: 약속 관련 액션 증가에 따른 파일 복잡도 축소, 책임 분리, 테스트/리뷰 범위 명확화
- Scope: `src/actions/appointment/*`, `src/actions/appointment.ts`, `src/actions/appointment.test.ts`

## Auth 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/auth.ts` 단일 파일을 `src/actions/auth/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `auth.ts` 유지
- Reason: 인증 액션 책임 분리 및 구조 일관성 확보(`user/group/appointment`와 동일 패턴)
- Scope: `src/actions/auth/*`, `src/actions/auth.ts`

## 그룹 선택 쿠키 로직 공통화 (2026-02-09)
- Decision: 그룹 선택 쿠키 read/write 공통 로직을 `src/libs/server/groupSelectionCookie.ts`로 추출하고, action/read 엔트리가 이를 재사용
- Alternatives: `src/actions/groupSelection.ts`와 `src/libs/server/groupSelection.ts`에 중복 유지
- Reason: 쿠키 키/옵션 드리프트 방지, 유지보수성 개선
- Scope: `src/libs/server/groupSelectionCookie.ts`, `src/actions/groupSelection.ts`, `src/libs/server/groupSelection.ts`

## 그룹 선택 로직 단일 파일 통합 (2026-02-09)
- Decision: `groupSelection` read/write 로직을 `src/libs/server/groupSelection.ts` 단일 파일로 통합하고 보조 파일 제거
- Alternatives: action/read/cookie 유틸 2~3개 파일 분리 유지
- Reason: 코드량 대비 파일 분산이 과해 탐색 비용이 커짐, 단일 파일이 현재 복잡도에 더 적합
- Scope: `src/libs/server/groupSelection.ts`, `src/provider/group-provider.tsx`, `src/app/dashboard/(nav)/page.tsx`, `src/app/dashboard/(plain)/appointments/create/page.tsx`, `src/actions/groupSelection.ts`, `src/libs/server/groupSelectionCookie.ts`

## 검색 결과 실제 인원수 조회 방식 (2026-02-10)
- Decision: 검색(그룹/약속)에서 실제 인원수를 위해 `security definer` RPC(`search_groups_with_count`, `search_appointments_with_count`)를 사용
- Alternatives: RLS 완화 후 일반 select/count, 더미 데이터 유지
- Reason: 실제 인원수 정확성을 유지하면서 멤버 테이블 row 전체 노출 범위를 불필요하게 넓히지 않기 위함
- Scope: `supabase/migrations/20260210162000_search_count_rpc.sql`, `src/actions/group/searchGroupsWithCountAction.ts`, `src/actions/appointment/list/search.ts`, `src/app/dashboard/(nav)/search/**`

## Appointment 액션 공통 가드/응답 패턴 적용 (2026-02-12)
- Decision: `appointment` 도메인 액션 전반에 `parseOrFail`, `requireUser`, `actionError/actionSuccess` 패턴을 통일 적용
- Alternatives: 액션별 수동 `safeParse`, `auth.getUser`, `{ ok: false/true }` 반환 유지
- Reason: 반복 코드 제거, 에러/응답 포맷 일관성 확보, 신규 액션 작성 시 실수 가능성 축소
- Scope: `src/actions/appointment/**` (comment 포함)

## Appointment 액션 파일명 단축 (2026-02-12)
- Decision: `appointment` 및 `appointment/comment` 액션 파일명에서 `*Action` 접미사를 제거하고 동작 중심의 짧은 파일명으로 통일
- Alternatives: 기존 긴 파일명 유지
- Reason: 도메인 폴더 자체가 컨텍스트를 제공하므로 파일명은 동작만 표현하는 편이 탐색성과 가독성에 유리
- Scope: `src/actions/appointment/**`, `src/actions/appointment/comment/**`, `src/actions/appointment/index.ts`

## Appointment 액션 계층 재구성 (2026-02-12)
- Decision: `appointment` 액션을 `create/list/detail/member/comment` 하위 도메인 폴더로 재구성하고, `_shared.ts`를 `types.ts`로 변경
- Alternatives: `appointment` 루트에 액션 파일을 평면으로 유지
- Reason: 목록/상세/멤버/댓글 유스케이스가 혼재되어 `index`/공통 타입의 역할이 흐려졌고, 하위 도메인 분리로 책임 경계를 명확히 하기 위함
- Scope: `src/actions/appointment/**`, `src/actions/appointment/index.ts`, `src/actions/appointment/types.ts`

## 약속 종료 상태 파생 처리 도입 (2026-02-13)
- Decision: DB `status` 원본값과 별개로 `ends_at` 기반 파생 상태(`ended`)를 UI에서 계산해 노출한다.
- Alternatives: DB에 `ended`를 즉시 물리 저장(배치/트리거), 기존 `pending/confirmed`만 노출 유지
- Reason: 운영 부하를 늘리는 스케줄러 없이도 사용자 화면에서 종료 상태를 즉시 일관되게 보장하고, 이후 `confirmed` 축소 마이그레이션을 단계적으로 진행하기 위함
- Scope: `src/utils/appointmentStatus.ts`, `src/app/dashboard/_components/AppointmentCard.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`

## 약속 상세 소유자 상태 전환 단순화 (2026-02-13)
- Decision: 약속 상세에서 소유자에게 `확정하기/확정 취소`를 제거하고 `초대하기 + 취소하기(+취소 상태에서 활성화)`만 제공한다.
- Alternatives: 기존 `확정/확정취소` 유지, 즉시 DB enum에서 `confirmed` 제거
- Reason: 상태 모델 단순화를 UI부터 선적용해 사용자 플로우를 안정화하고, DB/마이그레이션 변경은 후속 단계로 분리하기 위함
- Scope: `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`

## 약속 상태 정규화(`confirmed` → `pending`) (2026-02-13)
- Decision: 앱 계층에서 `confirmed`를 별도 상태로 노출하지 않고 `pending`으로 정규화하며, 종료 여부는 `ends_at` 기반 파생 상태(`ended`)로만 표현한다.
- Alternatives: `confirmed` 상태를 클라이언트까지 유지, 즉시 DB enum 제거 마이그레이션 동시 진행
- Reason: 상태 전이 복잡도를 즉시 줄이면서도 기존 데이터와 호환성을 유지하고, DB enum 정리는 운영 타이밍에 맞춰 분리하기 위함
- Scope: `src/actions/appointment/list.ts`, `src/actions/appointment/[appointmentId]/get.ts`, `src/actions/appointment/[appointmentId]/updateStatus.ts`, `src/utils/appointmentStatus.ts`, `src/app/dashboard/_components/AppointmentCard.tsx`

## appointment_status enum 축소 마이그레이션 (2026-02-13)
- Decision: DB 레벨에서도 `appointment_status`에서 `confirmed`를 제거하고 `pending/canceled`만 유지한다.
- Alternatives: enum은 유지하고 앱 레이어 정규화만 지속
- Reason: 앱/DB 상태 모델의 불일치를 제거하고, 추후 RLS/RPC/분석 쿼리에서 상태 분기를 단순화하기 위함
- Scope: `supabase/migrations/20260213174000_remove_confirmed_from_appointment_status.sql`

## 약속 상태 변경 진입점 단일화 (2026-02-13)
- Decision: 약속 `취소/활성화` 버튼을 상세 화면에서 제거하고 수정 화면으로 단일화한다.
- Alternatives: 상세 화면과 수정 화면에 상태 버튼 병행 노출
- Reason: 상태 변경 UX를 한 화면에 모아 캐시 동기화/버튼 상태 불일치 이슈를 줄이기 위함
- Scope: `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/edit/AppointmentEditClient.tsx`

## 프로필 리뷰 라우트 역할 분리 (2026-02-15)
- Decision: `/dashboard/profile/reviews`는 내 리뷰 목록 전용으로 전환하고, 리뷰 작성/수정은 `/dashboard/profile/reviews/[appointmentId]`로 분리한다.
- Alternatives: 기존처럼 `/dashboard/profile/reviews?appointmentId=...` 단일 페이지에서 목록/작성 역할을 혼합
- Reason: 목록과 편집의 책임을 분리해 URL 의미를 명확히 하고, 무한 스크롤/드롭다운 액션(수정/삭제) 유지보수를 단순화하기 위함
- Scope: `src/app/dashboard/(plain)/profile/reviews/**`, `src/actions/appointment/review/**`, `src/libs/query/appointmentQueries.ts`

## 약속 초대 상태 캐시 소유권 전환 (2026-02-16)
- Decision: 약속 초대 페이지의 `멤버 목록 + pending 초대 목록` 조회를 `useEffect + 2개 서버액션`에서 `React Query + 단일 서버액션(getAppointmentInvitationStateAction)`으로 전환한다.
- Alternatives: 기존처럼 `getAppointmentMembersAction`/`getPending...`를 클라이언트에서 병렬 호출
- Reason: 개발 모드 중복 요청(Strict Mode)과 상태 분산을 줄이고, 초대 성공/충돌 시점의 UI 상태 동기화를 Query Cache 단일 소스로 유지하기 위함
- Scope: `src/actions/appointment/[appointmentId]/members/getInvitationState.ts`, `src/libs/query/appointmentKeys.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/(plain)/appointments/invitation/AppointmentInvitationClient.tsx`

## 알림함 기반 초대 응답 플로우 도입 (2026-02-20)
- Decision: 대시보드 TopNav에 알림 진입점을 추가하고, `/dashboard/notifications`에서 받은 초대(그룹/약속)를 무한 스크롤로 조회/수락/거절 처리한다.
- Alternatives: 기존 개별 화면(그룹/약속 초대 화면)에서만 상태 확인, 알림함 없이 초대 상태를 분산 관리
- Reason: 초대 응답 동선을 한 화면으로 통합해 사용성/유지보수성을 높이고, 수락 시 타입별 멤버 반영(그룹/약속)을 일관된 액션으로 처리하기 위함
- Scope: `src/app/dashboard/_components/nav/TopNavigation.tsx`, `src/app/dashboard/(plain)/notifications/**`, `src/actions/invitation/**`, `src/libs/query/invitation*.ts`, `supabase/migrations/20260220120000_invitations_invitee_select_update_policy.sql`

## 리뷰 소유 단위 전환 (place → appointment) (2026-02-23)
- Decision: 리뷰 저장/수정/삭제/작성가능 여부 판단의 소유 단위를 `place_id`에서 `appointment_id`로 전환하고, 같은 장소라도 약속별 리뷰를 허용한다.
- Alternatives: 기존 place 단위 1리뷰 유지, place+user 단위로만 수정
- Reason: 실제 사용자 플로우(약속 단위 경험 기록)와 데이터 모델을 일치시키고, 히스토리/리뷰대기에서 같은 장소의 다른 약속 리뷰를 막는 문제를 해소하기 위함
- Scope: `supabase/migrations/20260223220000_review_domain_to_appointment.sql`, `src/actions/appointment/review/**`, `src/actions/appointment/history/list.ts`, `src/libs/query/appointmentKeys.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/(nav)/profile/_components/ReviewsWaitList.*`, `src/hooks/useHorizontalDragScroll.ts`

## 프로필 Plain 페이지/메뉴 UI 공통화 (2026-02-23)
- Decision: 프로필 plain 영역(그룹/히스토리/리뷰/댓글)의 반복 레이아웃 스타일을 공통 primitive로 통합하고, 카드의 more 메뉴를 `OverflowMenu` atom으로 추출한다.
- Alternatives: 각 페이지/카드별 개별 스타일 및 드롭다운 구현 유지
- Reason: 페이지 간 시각 일관성 확보, 폰트/간격 drift 방지, 외부 클릭 닫기/메뉴 상호작용 중복 코드 축소
- Scope: `src/styles/primitives/plainListPage.css.ts`, `src/components/ui/OverflowMenu.*`, `src/app/dashboard/(plain)/profile/**/page.css.ts`, `src/app/dashboard/(plain)/profile/comments/_components/MyCommentCard.*`

## 날짜/시간/상대시간/지역명 표시 유틸 단일화 (2026-02-23)
- Decision: 화면별로 중복 구현하던 날짜/시간/상대시간/주소 지역명 포맷 로직을 `src/utils/dateFormat.ts`, `src/utils/address.ts`로 통합하고 각 UI에서 공통 유틸을 사용한다.
- Alternatives: 컴포넌트별 로컬 포맷 함수 유지
- Reason: 표시 규칙 drift를 방지하고, 포맷 변경 시 수정 지점을 한 곳으로 줄여 유지보수성을 높이기 위함
- Scope: `src/utils/dateFormat.ts`, `src/utils/address.ts`, `src/app/dashboard/**` 내 appointment/profile/notification 관련 카드·상세 컴포넌트

## 날짜시간/장소메타 UI 컴포넌트 공통화 (2026-02-23)
- Decision: 반복되던 `아이콘+날짜/시간`과 `장소 평점+태그` UI를 `DateTimeMetaRow`, `PlaceRatingMeta` 공통 컴포넌트로 추출해 재사용한다.
- Alternatives: 각 화면에서 마크업/아이콘/구분자 직접 구성 유지
- Reason: 화면 간 UI 일관성을 높이고, 구조/표시 로직 변경 시 다수 파일 동시 수정 비용을 줄이기 위함
- Scope: `src/components/ui/DateTimeMetaRow*`, `src/components/ui/PlaceRatingMeta*`, `src/app/dashboard/**` 내 검색/리뷰대기/약속상세/약속수정/히스토리/리뷰에디터/대시보드 카드

## 사용자 아바타/이름 라인 공통화 (2026-02-23)
- Decision: 반복되던 `프로필 이미지 + 이름(+me) (+부가텍스트)` 표시를 `UserIdentityInline` 공통 컴포넌트로 통합한다.
- Alternatives: 화면별로 아바타/이름 마크업을 개별 유지
- Reason: 프로필 라인 UI를 통일하고, 아바타 크기/텍스트/`me` 표시 변경 시 수정 지점을 줄이기 위함
- Scope: `src/components/ui/UserIdentityInline*`, `src/app/dashboard/**` 내 그룹관리/멤버목록/약속상세 작성자/히스토리 작성자/알림 발신자/검색카드 작성자

## 버튼 스타일 소스 단일화 (2026-02-23)
- Decision: `LoginButton`/`SubmitButton`의 베이스 스타일을 `Buttons.css.ts` 독자 정의에서 `styles/primitives/actionButton.css.ts` 조합 방식으로 전환한다.
- Alternatives: 기존 `Buttons.css.ts`에서 중복 버튼 규칙 유지
- Reason: 버튼 컴포넌트마다 패딩/라운드/disabled 상태 규칙이 분산되는 것을 막고, 전역 버튼 톤/사이즈 수정 시 수정 지점을 줄이기 위함
- Scope: `src/components/ui/Buttons.tsx`, `src/components/ui/Buttons.css.ts`, `src/styles/primitives/actionButton.css.ts`

## user_review PK 구조 정규화 (2026-02-23)
- Decision: `user_review`의 레거시 복합 PK(`user_id`,`place_id`)를 제거하고, 단일 PK(`review_id`) + 부분 유니크 인덱스(`user_id`,`appointment_id`) 구조로 정규화한다.
- Alternatives: 기존 복합 PK 유지, 앱 로직에서만 우회 처리
- Reason: 같은 장소라도 약속별 리뷰를 허용하는 현재 도메인 규칙(appointment 단위)과 DB 제약을 일치시키고, `duplicate key ... user_places_pkey` 저장 실패를 제거하기 위함
- Scope: `supabase/migrations/20260223234000_user_review_pk_to_review_id.sql`, `public.user_review` 제약/인덱스

## PlainTopNav 래퍼 제거 및 직접 사용 (2026-02-24)
- Decision: `Appointment*TopNav` 래퍼 컴포넌트를 제거하고, 각 화면에서 `PlainTopNav`를 직접 사용한다.
- Alternatives: 화면별 래퍼를 유지한 채 `PlainTopNav` props만 위임
- Reason: 단순 위임 래퍼가 파일 탐색 비용만 늘리고 변경 지점을 분산시켜 유지보수성이 떨어졌기 때문
- Scope: `src/app/dashboard/(plain)/appointments/**` 내 상세/수정/멤버/초대 페이지, `src/components/ui/PlainTopNav.tsx`

## 드롭다운 베이스 컴포넌트 단일화 (2026-02-24)
- Decision: 드롭다운 류 UI의 open/close/outside-click 베이스를 `DropdownMenu`로 단일화한다.
- Alternatives: `OverflowMenu`/`ProfileDrop`/선택 드롭다운별 개별 구현 유지
- Reason: 외부 클릭 닫기/토글 로직 중복을 줄이고, 드롭다운 동작 일관성을 확보하기 위함
- Scope: `src/components/ui/DropdownMenu.tsx`, `src/components/ui/OverflowMenu.tsx`, `src/app/dashboard/_components/nav/ui/ProfileDrop.tsx`, `src/app/dashboard/_components/nav/TopNavigation.tsx`, `src/app/dashboard/_components/GroupsDropdown.tsx`, `src/app/dashboard/_components/PeriodFilter.tsx`

## 드롭다운/칩 시각 스타일 토큰 단일화 (2026-02-24)
- Decision: 드롭다운/칩 UI의 시각 규칙(보더, 라운드, 그림자, hover, disabled)을 `styles/primitives/dropdown.css.ts`, `styles/primitives/chip.css.ts`로 단일화한다.
- Alternatives: 컴포넌트별 `*.css.ts`에 개별 스타일 유지
- Reason: 메뉴/필터/프로필 드롭다운 간 시각적 드리프트를 줄이고, 향후 톤 변경 시 수정 지점을 primitive 레벨로 축소하기 위함
- Scope: `src/styles/primitives/dropdown.css.ts`, `src/styles/primitives/chip.css.ts`, `src/app/dashboard/_components/{PeriodFilter,GroupsDropdown,TypeFilter}.css.ts`, `src/components/ui/OverflowMenu.css.ts`, `src/app/dashboard/_components/nav/ui/ProfileDrop.css.ts`, `src/components/ui/ChipToggleGroup.tsx`

## 리뷰 대기 목록 쿼리 소유 정리 (2026-02-24)
- Decision: `/dashboard/profile/reviews/waitlist`는 히스토리 쿼리를 재사용하지 않고, 리뷰 대기 전용 쿼리(`reviewable`)를 직접 사용한다.
- Alternatives: `history` 쿼리 + 클라이언트 필터(`canWriteReview`) 유지
- Reason: 클라이언트 필터/빈 결과 재요청 루프를 제거해 네트워크 낭비를 줄이고, 화면 목적과 쿼리 소유를 일치시키기 위함
- Scope: `src/app/dashboard/(plain)/profile/reviews/waitlist/ProfileReviewWaitListClient.tsx`, `src/libs/query/appointmentQueries.ts`

## Mutation Invalidate 플랜 중앙화 (2026-02-24)
- Decision: 컴포넌트마다 분산된 `invalidateQueries` 나열을 도메인 helper 플랜으로 중앙화한다.
- Alternatives: 각 클라이언트 컴포넌트에서 invalidate 리스트를 직접 유지
- Reason: 누락/중복 invalidate를 줄이고, mutation 후 캐시 동기화 규칙을 단일 파일에서 관리하기 위함
- Scope: `src/libs/query/invalidateAppointmentQueries.ts`, `src/libs/query/invalidateGroupQueries.ts`, `src/libs/query/invalidateInvitationQueries.ts`, `src/app/dashboard/(plain)/**` mutation caller 컴포넌트

## 그룹 생성/멤버 초대 플로우 대시보드 단일화 (2026-02-25)
- Decision: 그룹 생성/멤버 초대의 기준 경로를 `dashboard/profile/groups/**`로 통합하고, 온보딩 `create/invitation` 개별 페이지는 제거한다.
- Alternatives: 온보딩(`/group/create`, `/group/invitation`)과 대시보드 멤버 관리 경로를 별도 구현으로 병행 유지
- Reason: 동일 기능의 중복 구현을 제거해 유지보수 복잡도를 낮추고, 그룹 관리-생성-초대를 하나의 정보 구조에서 일관되게 제공하기 위함
- Scope: `src/app/dashboard/(plain)/profile/groups/**`, `src/app/(onboarding)/group/create/**`, `src/app/(onboarding)/group/invitation/**`, `src/components/ui/PlainTopNav.tsx`

## 그룹 가입(검색/가입) 플로우 대시보드 단일화 (2026-02-25)
- Decision: 그룹 가입 플로우의 기준 경로를 `/dashboard/profile/groups/find`로 통합하고, 온보딩 `join` 계열 개별 페이지는 제거한다.
- Alternatives: 온보딩(`/group/join`, `/group/join/confirm`, `/group/join/complete`) 화면을 별도 유지
- Reason: 그룹 생성/초대와 마찬가지로 가입 플로우도 중복 구현을 제거해 그룹 도메인 진입점을 `profile/groups`로 단일화하기 위함
- Scope: `src/app/dashboard/(plain)/profile/groups/find/**`, `src/app/dashboard/(plain)/profile/groups/ProfileGroupsClient.tsx`, `src/app/(onboarding)/group/join/**`, `src/app/(onboarding)/group/page.tsx`

## Profile/Group 상단 레이아웃 반응형 안정화 (2026-02-25)
- Decision: 그룹 관리 상단 필터 영역을 줄바꿈 가능한 반응형 레이아웃으로 변경하고, plain 레이아웃의 오버플로우를 `Y축 자동 스크롤 + X축 숨김`으로 고정한다. 또한 프로필 빠른 링크는 공용 스택 컴포넌트 의존을 줄이고 로컬 마크업으로 고정한다.
- Alternatives: 기존 한 줄 고정 필터 레이아웃 + `overflow: scroll` 유지, 빠른 링크의 공용 컴포넌트 의존 유지
- Reason: 좁은 화면에서 칩/액션 버튼이 가로로 넘치며 가로 스크롤 상태로 보이는 문제를 제거하고, 공용 스타일 변경에 따른 화면별 시각 드리프트를 줄이기 위함
- Scope: `src/app/dashboard/(plain)/layout.css.ts`, `src/app/dashboard/(plain)/profile/groups/page.css.ts`, `src/app/dashboard/(nav)/profile/_components/ProfileQuickLinks.tsx`, `src/app/dashboard/(nav)/profile/_components/ProfileQuickLinks.css.ts`

## 저가치 공통 스타일 추상화 정리 (2026-02-25)
- Decision: 재사용 이점이 낮은 공통 UI/스타일 추상화는 제거하고, 단일 사용처는 로컬 마크업/로컬 스타일로 전환한다.
- Alternatives: 기존 공통 컴포넌트(`IconStackLabel`)와 alias-only 스타일 파일(`TypeFilter.css.ts`) 유지
- Reason: 공통 추상화가 많아질수록 호출부의 의도 파악이 어려워지고, 단일 사용처에서는 오히려 탐색 비용과 클래스 합성 복잡도만 증가하기 때문
- Scope: `src/app/dashboard/_components/nav/BottomNavigation.tsx`, `src/app/dashboard/_components/nav/BottomNavigation.css.ts`, `src/app/dashboard/_components/TypeFilter.tsx`, `src/app/dashboard/_components/TypeFilter.css.ts`, `src/components/ui/IconStackLabel.tsx`, `src/components/ui/IconStackLabel.css.ts`, `ai_docs/STYLE_GUIDE.md`

## 검색 인풋 컴포넌트 단일화 (2026-02-25)
- Decision: 검색 입력 행(`input + submit`)은 `src/components/ui/SearchInput.tsx` 공통 컴포넌트로 단일화하고, 화면별 라벨/헬퍼/검증 메시지는 로컬에서 유지한다.
- Alternatives: 검색 화면/그룹 찾기/초대/장소 검색별 로컬 검색 인풋 마크업 유지
- Reason: 동일한 검색 입력 UI가 여러 화면에 분산되어 스타일/상호작용 drift가 발생하므로, 입력 행만 공통화해 일관성을 확보하고 중복 유지보수 비용을 줄이기 위함
- Scope: `src/components/ui/SearchInput*`, `src/app/dashboard/(nav)/search/_components/SearchResultsClient.tsx`, `src/app/dashboard/(plain)/profile/groups/find/GroupFindClient.tsx`, `src/app/dashboard/(plain)/profile/groups/[groupId]/members/invitation/GroupMemberInvitationClient.tsx`, `src/app/dashboard/(plain)/appointments/invitation/AppointmentInvitationClient.tsx`, `src/app/dashboard/(plain)/appointments/create/_components/PlaceStep.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/edit/place/AppointmentEditPlaceClient.tsx`, `ai_docs/STYLE_GUIDE.md`

## 새약속 만들기 다음 액션 단일화 (2026-02-25)
- Decision: 새약속 멀티스텝의 다음 이동/검증은 각 step 내부 버튼이 아니라 `PlainTopNav` 우측 액션에서 중앙 처리한다.
- Alternatives: `GroupStep`/`TitleStep`/`DateTimeStep`/`PlaceStep`에서 `NextButton`을 유지하며 step별로 다음 이동 로직을 분산 유지
- Reason: 네비게이션 패턴을 상단바 기준으로 통일하고, step 이동 검증 로직을 한 곳에서 관리해 중복/드리프트를 줄이기 위함
- Scope: `src/app/dashboard/(plain)/appointments/create/MultiStepFormClient.tsx`, `src/app/dashboard/(plain)/appointments/create/_components/{GroupStep,TitleStep,DateTimeStep,PlaceStep}.tsx`, `src/app/dashboard/(plain)/appointments/create/_components/ui/NextButton.*`

## 히스토리 조회 RPC 통합 (2026-02-25)
- Decision: 프로필 히스토리 약속 조회를 다중 쿼리(`appointments` + `appointment_members` + `user_review`)에서 단일 RPC(`list_appointment_history_with_stats`) 호출로 통합한다.
- Alternatives: 기존 액션에서 3개 쿼리를 유지하고 앱 레이어에서 집계 처리
- Reason: 장소 리뷰 집계/내 리뷰 여부 판별을 앱에서 대량 row 처리하던 병목을 제거하고, 히스토리 페이지 요청당 DB round trip 수를 줄이기 위함
- Scope: `supabase/migrations/20260225213000_list_appointment_history_with_stats_rpc.sql`, `src/actions/appointment/history/list.ts`, `src/actions/appointment/history/list.test.ts`

## 장소 상세 조회 RPC 통합 (2026-02-25)
- Decision: 장소 상세 조회를 `places` + `user_review` 다중 쿼리에서 단일 RPC(`get_place_detail_with_stats`) 호출로 통합한다.
- Alternatives: 기존 액션에서 상세 조회와 리뷰 집계를 각각 조회하고 앱 레이어에서 평균/개수 계산
- Reason: 상세 진입 시 DB 왕복 횟수와 앱 레이어 집계 비용을 줄여 응답 시간을 안정화하기 위함
- Scope: `supabase/migrations/20260225223000_get_place_detail_with_stats_rpc.sql`, `src/actions/place.ts`, `src/actions/place.test.ts`

## 초대 검색 상태 조회 범위 축소 (2026-02-25)
- Decision: 그룹/약속 초대 검색 시 멤버/초대 상태 조회를 전체 그룹/약속 범위가 아니라 검색 후보 사용자 ID 집합 범위로 제한한다.
- Alternatives: 기존처럼 검색마다 `group_members`/`appointment_members`/`invitations`를 전체 조회 후 앱에서 필터
- Reason: 입력당 불필요한 row 스캔/전송을 줄여 대규모 그룹에서 검색 응답 지연을 완화하기 위함
- Scope: `src/actions/group/searchGroupInvitableUsersAction.ts`, `src/actions/appointment/[appointmentId]/members/searchInvitees.ts`, 관련 테스트 2건

## 알림 목록 페이지네이션 키셋 전환 (2026-02-25)
- Decision: 받은 초대 목록 조회를 `offset` 커서에서 `created_time + invitation_id` 키셋 커서로 전환한다.
- Alternatives: 기존 `offset` 기반 `range(offset, offset + limit)` 유지
- Reason: 페이지가 깊어질수록 커지는 offset 스캔 비용을 줄이고, 알림 이력 데이터 증가 시 응답 지연을 완화하기 위함
- Scope: `src/actions/invitation/listReceived.ts`, `src/actions/invitation/types.ts`, `src/actions/invitation/listReceived.test.ts`

## 내 댓글 목록 페이지네이션 키셋 전환 (2026-02-25)
- Decision: `listMyCommentsAction` 페이지네이션을 `offset` 커서에서 `created_at + comment_id` 키셋 커서로 전환한다.
- Alternatives: 기존 `offset` 기반 `range(offset, offset + limit)` 유지
- Reason: 내 댓글 데이터가 누적될 때 깊은 페이지 요청의 offset 스캔 비용을 줄여 응답 지연을 완화하기 위함
- Scope: `src/actions/appointment/comment/listMine.ts`, `src/actions/appointment/types.ts`, `src/actions/appointment/comment/listMine.test.ts`

## 장소 리뷰 목록 RPC 키셋 전환 (2026-02-25)
- Decision: 장소 리뷰 목록 조회를 액션 내 `offset` 쿼리에서 RPC(`list_place_reviews_with_cursor`) 기반 키셋 커서(`updated_at + review_id`)로 전환한다.
- Alternatives: 기존 `range(offset, offset + limit)` 유지
- Reason: 리뷰가 많은 장소에서 깊은 페이지 offset 스캔 비용을 줄이고, 서버 액션의 쿼리 조합 복잡도(`or` 필터 + 커서 조건)를 DB 함수로 단순화하기 위함
- Scope: `supabase/migrations/20260225235900_list_place_reviews_with_cursor_rpc.sql`, `src/actions/place.ts`, `src/actions/place.test.ts`

## 내 리뷰 목록 RPC 키셋 전환 (2026-02-25)
- Decision: `listMyReviewsAction` 조회를 액션 내 `offset` 쿼리에서 RPC(`list_my_reviews_with_cursor`) 기반 키셋 커서(`updated_at + review_id`)로 전환한다.
- Alternatives: 기존 `range(offset, offset + limit)` 유지
- Reason: 리뷰 데이터가 누적될수록 커지는 offset 스캔 비용을 줄이고, 클라이언트 페이지네이션 커서를 장소 리뷰/알림/댓글과 동일한 키셋 패턴으로 통일하기 위함
- Scope: `supabase/migrations/20260226001000_list_my_reviews_with_cursor_rpc.sql`, `src/actions/appointment/review/listMine.ts`, `src/actions/appointment/review/listMine.test.ts`, `src/actions/appointment/types.ts`

## 리뷰 가능 목록 RPC 키셋 전환 (2026-02-25)
- Decision: `listReviewableAppointmentsAction` 조회를 `offset` 기반 RPC에서 키셋 RPC(`list_reviewable_appointments_with_stats_cursor`)로 전환한다.
- Alternatives: 기존 `list_reviewable_appointments_with_stats(p_offset, p_limit)` 유지
- Reason: 리뷰 대기 데이터가 누적될 때 깊은 페이지 요청의 offset 스캔 비용을 줄이고, 프로필 리뷰 영역 페이지네이션 패턴을 키셋으로 통일하기 위함
- Scope: `supabase/migrations/20260226004000_list_reviewable_appointments_with_stats_cursor_rpc.sql`, `src/actions/appointment/review/list.ts`, `src/actions/appointment/review/list.test.ts`, `src/actions/appointment/types.ts`

## 대시보드 약속 목록 커서 안정화 (2026-02-25)
- Decision: 대시보드 약속 목록 조회 커서를 단일 `start_at`에서 복합 키셋(`start_at + appointment_id`)으로 전환한다.
- Alternatives: 기존 `start_at` 단일 커서 유지
- Reason: 동일 시작 시각(`start_at`)의 약속이 여러 건일 때 페이지 경계에서 누락/중복이 발생할 수 있어 정렬/커서 일관성을 보장하기 위함
- Scope: `supabase/migrations/20260226005000_list_appointments_with_stats_cursor_rpc.sql`, `src/actions/appointment/list.ts`, `src/actions/appointment/list.test.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/_components/AppointmentList.tsx`, `src/actions/appointment/types.ts`

## 프로필 히스토리 커서 안정화 (2026-02-25)
- Decision: 프로필 히스토리 조회 커서를 `offset`에서 복합 키셋(`ends_at + appointment_id`)으로 전환한다.
- Alternatives: 기존 `offset` 유지
- Reason: 히스토리 데이터 증가 시 깊은 페이지 offset 스캔 비용을 줄이고, 페이지네이션 기준을 대시보드/리뷰 목록과 동일한 키셋 패턴으로 통일하기 위함
- Scope: `supabase/migrations/20260226005500_list_appointment_history_with_stats_cursor_rpc.sql`, `src/actions/appointment/history/list.ts`, `src/actions/appointment/history/list.test.ts`, `src/actions/appointment/types.ts`

## 키셋 페이지네이션 인덱스 보강 (2026-02-25)
- Decision: 최근 전환한 키셋 페이지네이션 쿼리 패턴에 맞춰 `appointments`/`appointment_comments`/`invitations`/`user_review`에 복합(부분) 인덱스를 추가한다.
- Alternatives: 기존 인덱스 상태 유지(쿼리 플래너에만 의존)
- Reason: 키셋 커서 전환만으로는 대량 데이터에서 정렬+필터 비용이 남을 수 있어, 실제 실행 계획에서 인덱스 탐색을 유도해 응답 시간 편차를 줄이기 위함
- Scope: `supabase/migrations/20260226012000_add_keyset_pagination_indexes.sql`

## 인증 상태 전환 시 쿼리 캐시 전역 초기화 (2026-02-25)
- Decision: 앱 전역 `Providers`에서 Supabase auth 상태(`SIGNED_IN`/`SIGNED_OUT`)를 구독하고, 이벤트 시 React Query 캐시를 전체 초기화한다.
- Alternatives: 로그인/로그아웃 화면에서만 수동 `queryClient.clear()` 유지
- Reason: 특정 화면 경로를 거치지 않는 인증 상태 변화(세션 만료/재인증/탭 간 상태 변화 등)에서도 이전 계정 캐시가 노출되지 않도록 보장하기 위함
- Scope: `src/app/providers.tsx`

## 약속 상세 댓글 목록 키셋 전환 (2026-02-25)
- Decision: 약속 상세 댓글 조회를 전체 조회(`count exact`)에서 키셋 페이지네이션(`created_at + comment_id`) 기반 무한 스크롤 패턴으로 전환한다.
- Alternatives: 기존 `getAppointmentCommentsAction` 단일 조회 + 상세 페이지 SSR prefetch 유지
- Reason: 댓글 수가 많아질수록 커지는 응답/하이드레이션 payload와 브라우저 렌더 부담을 줄여 상세 페이지 초기 체감 성능을 안정화하기 위함
- Scope: `src/actions/appointment/[appointmentId]/comments/list.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentCommentsSection.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/page.tsx`, `src/actions/appointment/[appointmentId]/comments/list.test.ts`

## React Query 기본 동작 안정화 (2026-02-25)
- Decision: 전역 QueryClient 기본값을 `focus 재조회 비활성 + mount/reconnect 재조회 활성 + retry 0` 프로파일로 조정한다.
- Alternatives: 기본값 유지(`focus` 기반 자동 재조회, query retry=1)
- Reason: 사용 중 원치 않는 자동 재조회와 재시도로 인한 UI 흔들림/중복 토스트를 줄이고, 화면 재진입 시점에 예측 가능한 갱신으로 통일하기 위함
- Scope: `src/libs/query/clientQueryClient.ts`

## 키셋 커서 datetime 오프셋 허용 (2026-02-25)
- Decision: 키셋 페이지네이션 커서의 datetime 스키마를 `z.string().datetime({ offset: true })`로 통일한다.
- Alternatives: 기본 `datetime()` 유지
- Reason: Postgres timestamptz 문자열(`+00:00` 오프셋 포함)을 기본 `datetime()`가 거부해 `유효한 커서 정보가 아닙니다.` 오류가 발생하는 문제를 방지하기 위함
- Scope: `src/actions/appointment/review/list.ts`, `src/actions/appointment/review/listMine.ts`, `src/actions/appointment/history/list.ts`, `src/actions/appointment/comment/listMine.ts`, `src/actions/appointment/[appointmentId]/comments/list.ts`, `src/actions/invitation/listReceived.ts`, `src/actions/place.ts`
