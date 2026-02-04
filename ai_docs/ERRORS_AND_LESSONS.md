# ERRORS_AND_LESSONS

## Mistake
- Server Action 내부에서 client 훅/상태 사용

## Lesson
- Server/Client boundary를 명확히 구분

## Preventive Rule
- Server Action은 side-effect만 담당하고 React 훅은 사용하지 않는다.


## Mistake
- `window.kakao.maps.LatLng is not a constructor`

## Lesson
- Kakao SDK는 `kakao.maps.load` 완료 전에 사용할 수 없다.

## Preventive Rule
- SDK 호출은 `kakao.maps.load` 콜백 내부에서만 수행한다.


## Mistake
- `kakao-map-script-error` 또는 `kakao-map-timeout`

## Lesson
- JS 키/도메인 설정 문제로 SDK가 로드되지 않는다.

## Preventive Rule
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`는 JS 키로 유지하고, 웹 도메인을 등록한다.


## Mistake
- `PostgREST 403 (error=42501)`

## Lesson
- RLS 정책이 누락되면 인증된 사용자도 접근할 수 없다.

## Preventive Rule
- 정책 추가 시 `ai_docs/DB_RLS.md`와 마이그레이션을 함께 갱신한다.


## Mistake
- `ERR_CONNECTION_REFUSED` on server action fetch

## Lesson
- 개발 서버가 죽었거나 실행되지 않았다.

## Preventive Rule
- server action 에러 발생 시 dev server 상태를 먼저 확인한다.


## Mistake
- `NextRouter was not mounted`

## Lesson
- App Router에서 `next/router`를 사용했다.

## Preventive Rule
- App Router에서는 `next/navigation`만 사용한다.
