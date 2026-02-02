# Current Session Summary

## Scope
- High-level snapshot of the project state for fast context loading.

## Key Flows
- Group onboarding flow implemented (join/create/invite).
- Appointments flow implemented (create + invite).
- Kakao map integration wired for place search + map preview.

## Group Flow
- Routes: `/group`, `/group/join`, `/group/join/confirm`, `/group/join/complete`, `/group/create`, `/group/create/complete`, `/group/invitation`, `/group/invitation/complete`.
- Actions: create/join/search groups, invite users, get my groups.
- Shared styles: `src/app/(onboarding)/group/shared.css.ts`.

## Appointments
- Routes: `/dashboard/appointments/create`, `/dashboard/appointments/invitation`, `/dashboard/appointments/invitation/complete`.
- Title duplicates allowed; date/time split; place search via Kakao REST API.
- Place search supports optional current-location sorting (radius 5km).
- Selected place shows map preview with marker + info window.
- Create route uses a route layout + context provider for initial group data.
- Step UI is split into per-step components with per-step css files.

## Navigation
- TopNav group dropdown uses group data fetched in app layout (no client fetch).
- Middleware redirects `/dashboard` to `/group` if no group membership.

## Kakao Integration
- JS SDK loader + hook + preview component in place.
- REST API used server-side for keyword search.
- Ensure JS key + Web domain registration for SDK.
- SDK is preloaded in app layout to reduce first map load latency.

## Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` (JavaScript key)
- `KAKAO_REST_API_KEY` (REST key)
