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
