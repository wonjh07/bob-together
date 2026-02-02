# Troubleshooting

## Kakao Map
- Error: `window.kakao.maps.LatLng is not a constructor`
  - Cause: SDK not fully ready.
  - Fix: create map/LatLng only inside `kakao.maps.load` callback.

- Error: `kakao-map-script-error`
  - Cause: SDK script blocked or invalid JS key.
  - Fix: ensure `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` is a JS key and domain is registered.
  - Check Network tab for `sdk.js` status and any adblock extensions.

## Supabase RLS
- Error: `PostgREST 403 (error=42501)`
  - Cause: missing RLS policy or grants for table.
  - Fix: verify policies in `ai_docs/CONTEXT_DB_RLS.md` and apply missing policies.

## Dev Server
- Error: `ERR_CONNECTION_REFUSED` on server action fetch
  - Cause: `npm run dev` not running or crashed.
  - Fix: restart dev server and retry.
