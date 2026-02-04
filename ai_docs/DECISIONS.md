# DECISIONS

## Format
- 변경내역
- 이유
- 대안

## 2026-02-04
### 변경내역
- Group dropdown을 TopNav에서 제거하고 대시보드 상단으로 이동
- 그룹 선택을 쿠키에 저장해 새로고침 시 유지
- ai_docs 정리: CONTEXT_ROUTES 병합, CONTEXT_SESSION 삭제, 액션 목록 중앙화

### 이유
- TopNav 의존성을 줄이고 대시보드에서만 그룹 선택 가능하도록 단순화
- 사용자 선택 유지 요구사항 충족
- 문서 중복 제거와 최신화

### 대안
- TopNav 유지 + 전역 그룹 상태로 유지
- 문서 유지하되 부분 업데이트
