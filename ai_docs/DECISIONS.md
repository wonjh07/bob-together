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
- Scope: `supabase/migrations/20260210162000_search_count_rpc.sql`, `src/actions/group/searchGroupsWithCountAction.ts`, `src/actions/appointment/searchAppointmentsByTitleAction.ts`, `src/app/dashboard/(nav)/search/**`
