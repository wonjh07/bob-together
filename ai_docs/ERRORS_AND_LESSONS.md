# ERRORS_AND_LESSONS

## 이슈제목
- Context:
- Cause:
- Fix:
- Lesson:

## Server Action에서 client 훅 사용
- Context: Server Action 내부 로직
- Cause: client 훅/상태 사용
- Fix: Server Action은 side-effect만 담당하고 React 훅을 제거한다
- Lesson: Server/Client boundary를 명확히 구분한다

## `window.kakao.maps.LatLng is not a constructor`
- Context: Kakao map 초기화
- Cause: SDK load 완료 전에 LatLng 호출
- Fix: `kakao.maps.load` 콜백 내부에서만 사용한다
- Lesson: SDK 준비 완료 이후에만 API를 호출한다

## `kakao-map-script-error` 또는 `kakao-map-timeout`
- Context: Kakao SDK 로딩
- Cause: JS 키/도메인 설정 문제
- Fix: `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`는 JS 키로 유지하고 웹 도메인을 등록한다
- Lesson: 키/도메인 설정이 로딩 성공의 전제 조건이다

## `PostgREST 403 (error=42501)`
- Context: Supabase RLS 접근
- Cause: RLS 정책 누락
- Fix: 정책 추가와 마이그레이션 후 `ai_docs/DB_RLS.md`를 갱신한다
- Lesson: 정책 변경은 문서/마이그레이션과 함께 갱신한다

## `NextRouter was not mounted`
- Context: App Router 컴포넌트
- Cause: `next/router` 사용
- Fix: `next/navigation`으로 교체한다
- Lesson: App Router에서는 `next/navigation`만 사용한다

## 약속 상세/댓글이 뒤로가기 후 이전 상태로 보임
- Context: 약속 상태 변경 또는 댓글 CRUD 후 목록/상세를 다시 열면 변경 전 데이터가 노출됨
- Cause: 서버 라우트 캐시와 React Query 캐시를 혼합 사용하면서 소유권이 분산됨
- Fix: 약속 상세/댓글을 React Query 소유로 통일하고 `appointmentKeys.detail/comments`를 기준으로 직접 갱신한다
- Lesson: 동일 도메인 데이터는 하나의 캐시 계층이 단일 소유해야 stale 이슈를 줄일 수 있다

## 전역 invalidate로 인한 과다 재요청
- Context: 단건 수정(상태 변경/수정/댓글) 이후 화면 전체가 불필요하게 다시 로드됨
- Cause: 광범위한 query key invalidation 사용
- Fix: `invalidateAppointmentDetailQueries`, `invalidateAppointmentCollectionQueries`로 목적별 invalidate를 분리한다
- Lesson: invalidate는 "무엇이 바뀌었는지" 기준으로 최소 범위로 실행해야 성능과 예측 가능성이 유지된다

## 댓글 상태 이중화로 동기화 복잡도 증가
- Context: 댓글 컴포넌트에서 props 상태와 query 상태를 함께 관리함
- Cause: 단일 진실 공급원(Single Source of Truth) 부재
- Fix: 댓글 데이터는 `useQuery` + `queryClient.setQueryData`로만 관리하고 props 의존을 제거한다
- Lesson: 리스트/상세 상태를 이중 보관하면 동기화 비용이 급격히 증가한다

## `router.refresh()` 의존으로 UX 지연
- Context: mutation 직후 화면 반영을 위해 새로고침 방식 사용
- Cause: 캐시 업데이트 전략 부재
- Fix: mutation 성공 시 쿼리 캐시를 직접 갱신하고 필요한 키만 invalidate한다
- Lesson: 새로고침 기반 해결은 최후 수단이며, 우선 캐시 갱신 경로를 설계해야 한다

## 리뷰 저장 실패 원인 미노출
- Context: 리뷰 작성/수정 시 UI에서 항상 `리뷰 저장에 실패했습니다.`만 표시되어 실제 원인 파악이 어려움
- Cause: `submitPlaceReviewAction`에서 PostgREST 에러 코드를 버리고 generic 메시지로 뭉개서 반환
- Fix: DB 에러 코드(`42501`, `23503`, `23505`)를 분기해 사용자 메시지를 구체화하고, 서버 로그에 `code/message/details/hint`를 남기도록 개선
- Lesson: DB/RLS 연동 액션은 generic 에러 한 줄로 끝내지 말고, 최소한 코드 기반 분기 + 구조화 로그를 남겨야 디버깅 속도를 확보할 수 있다

## `duplicate key ... user_places_pkey`로 리뷰 저장 실패
- Context: appointment 기반 리뷰 전환 이후, 같은 장소의 다른 약속 리뷰 저장 시 `23505` 발생
- Cause: 테이블명을 `user_review`로 바꿨지만 PK가 레거시 복합키(`user_id`,`place_id`)로 남아 도메인 규칙과 불일치
- Fix: `review_id` 단일 PK로 전환하고, 유니크 제약은 appointment 단위(`user_id`,`appointment_id`)만 유지하는 마이그레이션 적용
- Lesson: 도메인 키를 전환할 때는 컬럼/인덱스뿐 아니라 PK/제약까지 함께 정리해야 런타임 충돌을 막을 수 있다
