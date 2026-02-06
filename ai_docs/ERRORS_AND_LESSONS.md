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
