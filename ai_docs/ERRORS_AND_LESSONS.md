# ERRORS_AND_LESSONS

## 이슈제목
- Context:
- Cause:
- Fix:
- Lesson:

## 새로고침 시 무한스크롤 리스트가 비어 보이는 문제
- Context: 대시보드를 제외한 무한스크롤 리스트(히스토리/리뷰/댓글/알림/약속댓글 등)에서 새로고침 직후 데이터가 사라진 것처럼 보임
- Cause: `Providers`에서 Supabase auth 이벤트 `SIGNED_IN` 발생 시마다 `queryClient.clear()`를 실행해, 초기 세션 복원 흐름에서도 React Query 캐시가 비워졌음
- Fix: `INITIAL_SESSION` 이벤트에서 현재 유저를 먼저 동기화하고, `SIGNED_IN`에서는 **실제 계정 전환(currentUserId 변경)** 인 경우에만 캐시를 clear 하도록 변경. `SIGNED_OUT`은 기존대로 clear 유지
- Lesson: 인증 이벤트 기반 캐시 초기화는 `이벤트명`이 아니라 `세션 전환 맥락(초기 복원 vs 계정 변경)`을 기준으로 분기해야 한다

## 댓글 CRUD에서 DB 오류가 권한 오류로 오인됨
- Context: 댓글 작성/수정/삭제 실패 시 사용자에게 대부분 `권한 없음` 메시지로만 노출되어 실제 장애와 권한 오류를 구분하기 어려웠음
- Cause: `createAppointmentCommentAction`/`updateAppointmentCommentAction`/`deleteAppointmentCommentAction`이 DB 에러 코드를 구분하지 않고 광범위하게 `forbidden`으로 매핑
- Fix: 에러 코드를 분기해 `42501`/`23503`만 `forbidden`으로 처리하고, 그 외 예외 코드는 `server-error`로 반환 + 서버 로그 기록
- Lesson: 사용자 액션 실패는 최소한 `권한/입력/서버` 클래스 단위로 구분해 반환해야 재시도 판단과 장애 분석 속도를 확보할 수 있다

## 리뷰 카드 영역에서 `preload but not used` 경고 반복 출력
- Context: 프로필의 `작성 가능한 리뷰` 카드 리스트 렌더 직후 콘솔에 preload 경고가 반복적으로 출력됨
- Cause: 카드마다 `next/link` 자동 prefetch가 실행되며 route 리소스를 preload했지만 사용자 즉시 이동이 없어 브라우저가 경고를 출력
- Fix: 리뷰 카드 링크에 `prefetch={false}`를 명시해 불필요한 eager preload를 중단
- Lesson: 카드형 무한/대량 리스트의 링크는 기본 prefetch를 그대로 두지 말고, 실제 이동 패턴이 낮으면 페이지 단위로 prefetch 정책을 명시해야 콘솔 노이즈와 네트워크 낭비를 줄일 수 있다

## 프로필 진입 시 폰트 `preload but not used` 경고 출력
- Context: 프로필 페이지 최초 진입 시 `/_next/static/media/*-s.p.woff` 경고가 콘솔에 출력됨
- Cause: `next/font/local` 기본값(`preload: true`)으로 Pretendard 다중 weight가 초기 로드 시 preload되었고, 일부 weight(예: 200)는 즉시 사용되지 않음
- Fix: 루트 폰트 설정(`src/app/layout.tsx`)에 `preload: false`를 추가해 과도한 초기 preload를 중단
- Lesson: 다중 굵기 폰트를 등록할 때는 초기 화면에서 실제 사용하는 weight가 제한적이면 preload 정책을 명시적으로 조정해야 한다

## 작성 가능한 리뷰 카드에서 마우스휠 가로 스크롤이 비활성화됨
- Context: 프로필 홈의 `작성 가능한 리뷰` 카드에서 세로 휠을 돌려도 좌우 이동이 동작하지 않음
- Cause: 휠 리스너 등록 effect가 `[]` 의존성으로 최초 1회만 실행되어, 로딩 상태에서 `container`가 없으면 리스너가 끝내 등록되지 않음
- Fix: `ReviewsWaitList`의 휠 등록 effect 의존성을 `[items.length]`로 변경해 카드 렌더 이후 리스너가 등록되도록 수정
- Lesson: 로딩/조건부 렌더링에 의해 DOM ref가 늦게 생기는 경우, 이벤트 바인딩 effect를 최초 1회로 고정하면 누락될 수 있으므로 마운트 트리거에 맞는 의존성을 명시해야 한다

## 프로필 빠른 링크/그룹 관리 상단 UI가 간헐적으로 깨져 보임
- Context: 프로필 빠른 링크 섹션과 그룹 관리 상단(칩 + `그룹 찾기`/`새 그룹`)에서 간헐적으로 간격/크기/노출이 깨져 보이는 현상
- Cause:
  - 그룹 관리 상단이 한 줄 고정 레이아웃이라 좁은 폭에서 요소가 가로로 넘쳤고, plain 레이아웃의 `overflow: scroll`과 결합되어 화면이 가로 스크롤된 상태로 보일 수 있었음
  - 빠른 링크가 공용 스택 컴포넌트 스타일에 의존해, 공용 스타일 변경 시 의도치 않은 시각 드리프트가 생길 여지가 있었음
- Fix:
  - 그룹 관리 상단을 `flex-wrap` 기반 반응형으로 변경해 칩/액션 버튼이 작은 폭에서도 안전하게 줄바꿈되도록 수정
  - plain 레이아웃을 `overflow-y: auto` + `overflow-x: hidden`으로 변경해 가로 스크롤 진입 차단
  - 빠른 링크를 로컬 마크업/로컬 스타일로 고정하고 아이콘 `size`를 명시해 렌더 결과를 안정화
- Lesson: 공용 스타일 primitive를 합성할 때는 화면별 핵심 레이아웃(행/열, 폭, 오버플로우)을 로컬에서 명시하고, 작은 화면 폭에서의 줄바꿈/가로 스크롤 시나리오를 기본 QA에 포함해야 한다.

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

## 댓글 작성/수정/삭제 후 `내 댓글` 페이지가 이전 목록으로 보임
- Context: 약속 상세에서 댓글 CRUD 직후 빠르게 `프로필 > 내 댓글`로 이동하면 방금 변경이 반영되지 않음
- Cause: 상세 댓글 mutation 경로에서 `appointmentKeys.myComments()` 무효화가 누락되어, 60초 `staleTime` 동안 기존 캐시가 재사용됨
- Fix: `AppointmentCommentsSection`의 댓글 생성/수정/삭제 성공 경로에 `invalidateMyCommentsQueries(queryClient)`를 추가해 `내 댓글` 쿼리를 즉시 stale 처리
- Lesson: 같은 도메인 데이터를 여러 화면에서 조회할 때는 mutation 후 해당 도메인의 보조 리스트 키(`myComments`, `myReviews` 등)까지 invalidate 매트릭스에 포함해야 한다

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

## 약속 초대 수락 시 `약속 정보를 찾을 수 없습니다.` 발생
- Context: 알림함에서 약속 초대를 수락할 때 간헐적으로 `약속 정보를 찾을 수 없습니다.` 에러가 노출됨
- Cause: 약속 조회 RLS가 그룹 멤버만 허용인데, 그룹 미가입 사용자에게도 약속 초대가 발송될 수 있어 수락 시 약속 조회가 RLS로 차단됨
- Fix: 초대 발송 단계에서 초대 대상의 그룹 멤버십을 강제 검증하고, 수락 단계에서도 그룹 멤버십을 먼저 검사해 명확한 권한 에러 메시지를 반환하도록 보강
- Lesson: 초대/참여 플로우는 생성 시점과 수락 시점 모두에서 권한 전제(그룹 멤버십)를 이중 검증해야 런타임 RLS 오류를 사용자 에러로 노출하지 않는다
