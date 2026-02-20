# DECISIONS

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
