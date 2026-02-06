# CODEMAP

## 목적
- 1~2분 내에 “어디를 열지” 결정하기 위한 맵
- 상세 라우트/흐름은 `ai_docs/FLOWS.md` 참고

## Start Here (진입점)
- App root: `src/app/layout.tsx`
- Providers: `src/app/providers.tsx`, `src/provider/*`
- Dashboard (nav) layout: `src/app/dashboard/(nav)/layout.tsx`
- Dashboard (nav) home: `src/app/dashboard/(nav)/page.tsx`
- Dashboard (plain) layout: `src/app/dashboard/(plain)/layout.tsx`
- Appointment create entry: `src/app/dashboard/(plain)/appointments/create/page.tsx`
- Onboarding layout: `src/app/(onboarding)/layout.tsx`
- Server Actions: `src/actions/*`
- Schemas: `src/schemas/*`
- Shared UI: `src/components/*`
- Dashboard UI: `src/app/dashboard/_components/*`
- Styles: `src/styles/*`

## 핵심 사용자 흐름 (요약)
- Onboarding 그룹 흐름: `src/app/(onboarding)/group/*` (상세는 `ai_docs/FLOWS.md`)
- Dashboard 목록: `src/app/dashboard/(nav)/page.tsx` + `src/app/dashboard/_components/AppointmentList.tsx`
- 약속 생성: `src/app/dashboard/(plain)/appointments/create/page.tsx` + `src/app/dashboard/(plain)/appointments/create/MultiStepFormClient.tsx`
- 검색: `src/app/dashboard/(nav)/search/*`
- 프로필: `src/app/dashboard/(nav)/profile/*`

## 규칙/규범 참조
- `ai_docs/STYLE_GUIDE.md`
- `ai_docs/DESIGN_SCAN.md`
- `ai_docs/DECISIONS.md`
- `ai_docs/ERRORS_AND_LESSONS.md`

## 유지보수 규칙
- 구조 변경 시 “Start Here”와 “핵심 사용자 흐름”만 갱신
- 상세 라우트 변경은 `ai_docs/FLOWS.md`에만 반영
