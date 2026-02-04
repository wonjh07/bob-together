# Kakao Map Integration

## Env Vars
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` (JavaScript key)
- `KAKAO_REST_API_KEY` (REST API key)

## Client SDK
- Loader: `src/libs/kakao/loadKakaoMapScript.ts`
- Hook: `src/hooks/useKakaoMap.ts`
- Preview component: `src/components/kakao/KakaoMapPreview.tsx`
- Preload component: `src/app/(app)/components/KakaoMapPreload.tsx` (wired in app layout)

## Place Search (Server)
- Action: `src/actions/place.ts`
- Endpoint: https://dapi.kakao.com/v2/local/search/keyword.json
- Header: `Authorization: KakaoAK {REST_API_KEY}`

## Common Issues
- SDK script load fails if JavaScript key is missing.
- SDK ready state must be confirmed before using `LatLng`.
- Ensure app uses the JavaScript key, not REST key.
- Register local domain(s) in Kakao Developers > Platform > Web.
- Loader has a readiness timeout to avoid infinite loading states.

## Troubleshooting
- If map shows "unable to load", check console logs from loader.
- If `LatLng is not a constructor`, SDK not fully ready.
- If you see `kakao-map-timeout`, the SDK never became ready (often blocked script or unregistered domain).
