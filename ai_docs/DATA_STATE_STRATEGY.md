# Data Fetching & State Strategy

## 목적/범위
- 데이터 페칭, 쿼리, Provider, props 설계를 효율 관점에서 일관되게 판단하기 위한 규칙
- 상세 라우트나 스타일 규칙은 각 문서로 위임한다

## State 설계 체크리스트
- 컴포넌트가 반드시 필요한 상태만 소유한다
- 파생 가능한 값은 상태로 저장하지 말고 계산한다
- 동일 데이터는 한 곳에서만 관리한다
- 렌더에 영향 없는 값은 `useRef`로 유지한다
- 폼 라이브러리 상태와 로컬 state를 이중 관리하지 않는다

## Provider 사용 기준
- 여러 화면 또는 여러 단계에서 공유되는 상태일 때만 사용한다
- 단일 화면/단일 컴포넌트라면 지역 상태로 유지한다
- Query 캐시로 대체 가능한 데이터는 Provider로 만들지 않는다
- Provider는 UI와 데이터 책임이 섞이지 않게 최소 범위로 둔다
- 값/핸들러는 `useMemo`/`useCallback`로 안정화한다

## Props 설계 규칙
- 관련 props는 묶어서 전달한다 (예: formState, handlers)
- prop drilling이 깊어질 때만 Provider 도입을 고려한다
- UI 렌더링 책임과 데이터 로딩 책임을 분리한다
- 소유권이 없는 state의 setter는 넘기지 않는다
- 변경되는 객체/함수는 명시적으로 안정화한다

## 데이터 페칭/Query 판단 기준
- 서버에서 미리 확보 가능한 데이터는 server component에서 처리한다
- 반복 조회되거나 여러 컴포넌트에서 재사용되는 데이터는 Query 캐시를 사용한다
- `queryKey`는 재사용 가능한 유틸로 관리한다
- prefetch + hydration을 사용할 경우 SSR/CSR에서 동일한 `queryKey`를 사용한다
- mutation은 server action 기반으로 수행하고 필요 시 Query invalidation을 한다
- 에러/로딩 상태는 UI에서 반드시 노출한다
- 재시도 정책과 `staleTime`은 화면 특성에 맞게 정한다
- 페이지네이션/무한스크롤은 커서/필터를 `queryKey`에 포함한다
- `queryFn`은 순수 함수로 유지하고 부수효과를 넣지 않는다

## Hydration/SSR 고려사항
- SSR prefetch를 사용할 때는 클라이언트 쿼리 옵션과 맞춘다
- Hydration 범위를 최소화해 불필요한 리렌더를 줄인다
- 큰 payload는 분할하고 필요한 화면만 hydrate한다

## 보안/권한 기준
- 서버 검증을 최종 기준으로 둔다
- 클라이언트 검증은 UX 보조로만 사용한다

## 에러/관측성
- 서버 액션 실패는 로그/추적 가능하도록 처리한다
- 재현 가능한 오류 메시지를 남긴다

## 성능 가드레일
- 불필요한 리렌더를 유발하는 상태/props 구조를 피한다
- 리스트나 무거운 컴포넌트는 메모이제이션을 고려한다
- Step별 상태는 분리하고 제출 시점에만 집계한다
- 큰 리스트는 가상화 또는 페이지네이션을 고려한다
- Context 변화 범위를 줄인다

## 안티패턴
- 같은 데이터를 여러 곳에서 setState로 중복 관리
- Provider를 “편해서” 도입하고 실제 공유 필요가 없음
- queryKey를 파일마다 새로 정의
- SSR/CSR queryKey가 불일치
- 서버/클라이언트가 다른 기준으로 검증하여 결과 불일치

## 간단 예시
- Provider 필요: 여러 단계에서 공유되는 draft state
- Provider 불필요: 단일 Step 내부의 입력값
- Query 적합: 그룹 목록처럼 여러 화면에서 재사용되는 데이터

## 참고 문서
- 현재 프로젝트의 실제 소유 경계와 무효화 규칙은 `ai_docs/CACHE_OWNERSHIP.md`를 기준으로 한다.
