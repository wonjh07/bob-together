# Project Context

## Stack
- Next.js 14 App Router
- Supabase (Auth/Postgres/RLS)
- TanStack Query (React Query)
- Vanilla Extract for styling
- React Hook Form + Zod
- Jest for tests

## Conventions
- Server Actions in `src/actions/*`
- Supabase clients in `src/libs/supabase/*`
- Prefer reusing `utils/`, `libs/`, `hooks/`, `provider/` before creating new ones
- Always consider reusable components
- Prefer Server Components for pages; isolate Client Components when needed
- Write tests for new features
- Follow existing patterns in the codebase
- Routes:
  - Onboarding: `src/app/(onboarding)`
  - Dashboard (nav): `src/app/dashboard/(nav)`
  - Dashboard (plain): `src/app/dashboard/(plain)`

## Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`
- `KAKAO_REST_API_KEY`

## Notes
- Middleware (`src/middleware.ts`) redirects unauthenticated users to `/login`.
- Dashboard access is gated by group membership in middleware.
