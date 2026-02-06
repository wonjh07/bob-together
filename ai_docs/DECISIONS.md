# DECISIONS

## Template
- Decision:
- Alternatives:
- Reason:
- Scope:

## 대시보드 그룹 선택 위치 변경 (2026-02-04)
- Decision: 그룹 드롭다운을 TopNav에서 대시보드 상단으로 이동하고, 선택 상태를 쿠키에 저장하며, ai_docs를 정리
- Alternatives: TopNav 유지 + 전역 그룹 상태 유지, 문서는 부분 업데이트만 수행
- Reason: TopNav 의존성 축소, 대시보드 컨텍스트로 범위 제한, 사용자 선택 유지, 문서 중복 제거
- Scope: `src/app/**/dashboard/**`, `src/provider/group-provider.tsx`, `ai_docs/*`

## 대시보드 라우트 그룹 재구성 (2026-02-06)
- Decision: `(app)/(app-plain)`을 폐기하고 `src/app/dashboard/(nav)` / `(plain)`으로 통합
- Alternatives: 기존 `(app)`/`(app-plain)` 구조 유지
- Reason: 중복 폴더 구조 제거, 레이아웃 통합성 개선
- Scope: `src/app/dashboard/**`, `src/app/layout.tsx`
