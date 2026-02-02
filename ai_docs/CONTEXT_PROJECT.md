# Project Context

## Stack
- Next.js 14 App Router
- Supabase (Auth/Postgres/RLS)
- Vanilla Extract for styling
- React Hook Form + Zod
- Jest for tests

## Conventions
- Server Actions in `src/actions/*`
- Supabase clients in `src/libs/supabase/*`
- No inline styles (existing code may contain a few legacy inline uses)
- Routes:
  - Onboarding: `src/app/(onboarding)`
  - App shell: `src/app/(app)`

## Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`
- `KAKAO_REST_API_KEY`

## Notes
- Middleware (`src/middleware.ts`) redirects unauthenticated users to `/login`.
- Dashboard access is gated by group membership in middleware.
