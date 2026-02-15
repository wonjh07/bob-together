# Cache Ownership

## 목적
- 서버 캐시(App Router)와 클라이언트 캐시(React Query)의 소유 경계를 명확히 한다.
- 변경 액션 이후 어떤 무효화를 해야 하는지 파일 단위로 즉시 판단 가능하게 한다.

## 핵심 원칙
1. 하나의 데이터는 하나의 캐시를 주 소유자로 둔다.
2. 조회(`query`)와 변경(`mutation`) 책임을 분리한다.
3. `router.refresh()`는 예외가 아니라 규칙 기반으로만 사용한다.

## 용어
- `Server Cache`: Server Component 렌더 결과, RSC payload 캐시.
- `Client Cache`: TanStack Query `QueryClient` 메모리 캐시.

## Query Key 표준
- 약속 목록 루트: `appointmentKeys.listRoot()`
- 약속 목록: `appointmentKeys.list(groupId, period, type)`
- 약속 검색 루트: `appointmentKeys.searchRoot()`
- 약속 검색: `appointmentKeys.search(query)`
- 약속 상세: `appointmentKeys.detail(appointmentId)`
- 약속 댓글: `appointmentKeys.comments(appointmentId)`
- 약속 전체 무효화 범위: `appointmentKeys.all`
- 내 그룹 목록: `groupKeys.myGroups()`
- 그룹 검색: `groupKeys.search(query)`
- 그룹 전체 무효화 범위: `groupKeys.all`

## 화면별 소유 구조 (현재)
| 화면 | 경로 | 소유 캐시 | 조회 코드 | 기준 키 |
| --- | --- | --- | --- | --- |
| 대시보드 약속 목록 | `/dashboard` | Client | `src/app/dashboard/_components/AppointmentList.tsx` | `appointmentKeys.list(...)` |
| 대시보드 그룹 목록 | `/dashboard` | Client | `src/libs/query/groupQueries.ts` | `groupKeys.myGroups()` |
| 검색(그룹/약속) | `/dashboard/search` | Client | `GroupSearchResults.tsx`, `AppointmentSearchResults.tsx` | `groupKeys.search(...)`, `appointmentKeys.search(...)` |
| 약속 상세 | `/dashboard/appointments/[appointmentId]` | Client(Query) | `src/app/dashboard/(plain)/appointments/[appointmentId]/AppointmentDetailClient.tsx` | `appointmentKeys.detail(...)` |
| 약속 수정(상태 버튼) | `/dashboard/appointments/[appointmentId]/edit` | Client(Query) | `src/app/dashboard/(plain)/appointments/[appointmentId]/edit/AppointmentEditClient.tsx` | `appointmentKeys.detail(...)` |
| 약속 댓글 영역 | `/dashboard/appointments/[appointmentId]` | Client(Query) + Local UI State | `AppointmentDetailClient.tsx`, `AppointmentCommentsSection.tsx` | `appointmentKeys.comments(...)` + 로컬 상태 |

## Mutation 무효화 매트릭스 (현재 코드 기준)
| Mutation | 파일 | 영향 데이터 | 필수 후처리 |
| --- | --- | --- | --- |
| 약속 상태 변경 | `src/actions/appointment/detail/updateStatus.ts` | 상세 + 목록/검색 | 클라: `invalidateAppointmentDetailQueries` + `invalidateAppointmentCollectionQueries` |
| 약속 참여/나가기 | `src/actions/appointment/member/join.ts`, `src/actions/appointment/member/leave.ts` | 상세 + 목록/검색 | 클라: `invalidateAppointmentDetailQueries` + `invalidateAppointmentCollectionQueries` |
| 약속 수정 | `src/actions/appointment/detail/update.ts` | 상세 + 목록/검색 | 클라: `invalidateAppointmentDetailQueries` + `invalidateAppointmentCollectionQueries` |
| 댓글 생성/수정/삭제 | `src/actions/appointment/comment/create.ts`, `src/actions/appointment/comment/update.ts`, `src/actions/appointment/comment/delete.ts` | 상세 댓글/댓글수 + 목록 댓글수 | 로컬: `setQueryData(appointmentKeys.comments)` / 생성·삭제 후 `invalidateAppointmentCollectionQueries` |

## 실무 적용 규칙 (이 프로젝트 권장안)
1. 목록/검색은 Query 소유이므로 mutation 후 `invalidateQueries`를 기본으로 한다.
2. 상세도 Query 소유일 경우 `appointmentKeys.detail/comments` 무효화를 우선한다.
3. 상세 화면에서 즉시 UI 반영이 필요하면 로컬 patch를 유지하되, Query 재검증 규칙과 함께 사용한다.
4. `router.refresh()`는 라우트 캐시 동기화가 꼭 필요한 경우에만 사용한다.

## 변경 체크리스트
1. 이 데이터의 주 소유 캐시는 무엇인가 (`Server`/`Client`)?
2. mutation 이후 stale 될 화면은 어디인가 (목록/상세/검색)?
3. `invalidateQueries` 대상 key를 명시했는가?
4. Server 소유 화면이면 `revalidatePath`를 추가했는가?
5. `router.refresh()`를 쓰는 이유가 문서화되어 있는가?
6. 상세 카드 숫자(인원/댓글수) 동기화 경로가 정의되어 있는가?

## 안티패턴
- Server 소유 데이터인데 클라 invalidate만 하고 종료
- Query 소유 데이터인데 `revalidatePath`만 호출
- mutation마다 임시 `router.refresh()`를 흩뿌리고 기준이 없음
- 리스트 집계값(인원/댓글수)과 상세 집계값의 기준이 다름
