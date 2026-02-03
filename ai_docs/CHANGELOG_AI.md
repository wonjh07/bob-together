# AI Changelog (Rolling)

## 2026-02-03
- Added dashboard appointment list with GroupContext for shared group selection state.
- Created `listAppointmentsAction` with cursor-based pagination, period/type filters.
- Added `useInfiniteScroll` hook with IntersectionObserver for infinite scroll.
- Created filter components: `PeriodFilter` (dropdown), `TypeFilter` (chip buttons).
- Created `AppointmentCard` with status badges (confirmed/pending/canceled), participant info, edit button.
- Created `AppointmentList` integrating filters, cards, and infinite scroll.
- Refactored `TopNav` to use `useGroupContext()` instead of props.
- Wrapped app layout children with `GroupProvider` for shared group state.
- Updated dashboard page to render `AppointmentList` component.

## 2026-02-02 (late)
- Moved appointment routes from `(app)` to `(app-plain)` for step-based flow layout.
- Updated CONTEXT_ROUTES.md to reflect new route structure.

## 2026-02-02
- Added group onboarding flow pages and server actions.
- Added group RLS migration and middleware group gate for dashboard.
- Added Kakao map loader/hook/preview and place search action.
- Added appointment create/invite flow pages and actions.
- Added shared docs and tests for new actions.
- Limited appointment place result list height with internal scroll and left-aligned result cards.
- Moved appointment place map preview below search area, outside result cards.
- Split appointment create steps into separate components for each step.
- Added current location permission flow and distance-based place search input support.
- Added RLS policies for places/appointments/appointment_members to allow appointment creation flows.
- Added server-side logging for appointment creation failures to surface place/appointment errors.
- Moved appointment create group fetch to server page and introduced a client wrapper component to avoid double POST in dev.
- Moved app layout group fetch to server and passed groups into TopNav to avoid duplicate POSTs.
- Added Kakao map SDK preload in app layout to reduce first-map load latency.
- Cleared Kakao map container on updates to prevent previous map layers from overlapping.
- Moved appointment create data fetch into a route layout with context and made the page the UI entry point.
- Reused the existing Moveback component for appointment step navigation.
- Split appointment create step styles into per-step .css.ts files and slimmed page.css.ts.
- Restored place map preview rendering inside the place step after refactors.
- Reverted Moveback changes and reused its existing styles for the create step back button.
- Fixed onboarding signup router hook to use next/navigation in App Router.
- Added AI styling rules doc for Vanilla Extract and layout conventions.
- Added rules-by-example section to the styling guide.
- Refreshed context docs for appointments, Kakao, routes, session notes, and troubleshooting.
- Added Kakao map preview to the appointment confirm step.

## 2026-02-02 (docs)
- Added CONTEXT_SESSION/DB_RLS/ROUTES/TROUBLESHOOTING.
- Added update helper script and refreshed INDEX entries.
