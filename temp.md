# Action Error-Code Audit (Temp)

기준일: 2026-02-26  
범위: `src/actions/**/*.ts`(test 제외) + 관련 RPC 마이그레이션 대조

## 1) 에러코드 추가가 필요한 확정 항목

### 1.1 프로필 이미지 RPC `not-found` 식별 코드 부재
- 영향 파일:
  - `src/actions/user/uploadProfileImageAction.ts`
  - `src/actions/user/deleteProfileImageAction.ts`
- 현재 동작:
  - RPC `error_code = 'not-found'` 가능하지만 액션은 `update-failed`로 뭉개짐
- 위협:
  - 사용자/운영에서 원인(계정 레코드 없음 vs 일반 실패) 분리 불가
- 권장:
  - `profile-not-found`(또는 `user-not-found` 복원) 추가

### 1.2 약속 not-found 전용 코드 부재
- 영향 파일:
  - `src/actions/appointment/[appointmentId]/update.ts`
  - `src/actions/appointment/[appointmentId]/members/join.ts`
  - `src/actions/appointment/[appointmentId]/members/leave.ts`
  - `src/actions/appointment/[appointmentId]/members/invite.ts`
- 현재 동작:
  - RPC `appointment-not-found`를 `server-error`로 변환
- 위협:
  - 실제 not-found를 장애로 오인, 클라이언트 분기 불가
- 권장:
  - `appointment-not-found` 코드 추가(보안 정책상 숨겨야 하는 엔드포인트는 `forbidden` 유지 가능)

### 1.3 부분 성공(partial success) 식별 코드 부재
- 영향 파일:
  - `src/actions/user/uploadProfileImageAction.ts`
  - `src/actions/user/deleteProfileImageAction.ts`
  - `src/actions/user/updateProfileAction.ts`
- 현재 동작:
  - DB 반영 성공 후 `auth.updateUser` 실패해도 성공 처리(또는 단순 `update-failed`)
- 위협:
  - 데이터 레이어 간 불일치(users vs auth metadata) 발생 시 탐지 어려움
- 권장:
  - `metadata-sync-failed` 같은 코드 추가 또는 최소 구조화 로깅 + 관측 지표 분리

## 2) 추가 확인된 확정 위협(신규 코드 없이도 개선 가능)

### 2.1 런타임 입력 검증 누락(포맷 오류가 server-error로 유실)
- 영향 파일:
  - `src/actions/appointment/list.ts` (`groupId`, `cursor`, `limit`, `period`, `type`)
  - `src/actions/group/listMyGroupsWithStatsAction.ts` (`cursor`)
  - `src/actions/group/searchGroupsWithCountAction.ts` (`cursor`)
  - `src/actions/appointment/search.ts` (`cursor`)
- 위협:
  - 조작/깨진 입력이 DB 에러로 전파되어 UX는 `server-error`만 받음
- 권장:
  - `parseOrFail` 스키마로 cursor/limit/type 전체 검증

### 2.2 그룹 UUID 검증 불완전
- 영향 파일:
  - `src/actions/group/joinGroupAction.ts`
  - `src/actions/group/leaveGroupAction.ts`
  - `src/actions/group/getGroupMembersAction.ts`
  - `src/actions/group/sendGroupInvitationAction.ts`
- 위협:
  - UUID 형식 오류가 비일관 에러(`server-error` 또는 잘못된 메시지)로 노출
- 권장:
  - `groupId`, `inviteeId`에 UUID 스키마 도입

### 2.3 `sendGroupInvitationAction`의 `invalid-format` 메시지 오매핑
- 영향 파일:
  - `src/actions/group/sendGroupInvitationAction.ts`
- 현재 동작:
  - `invalid-format`이면 항상 `본인은 초대할 수 없습니다.`
- 위협:
  - 실제 포맷오류/파라미터 누락도 자기초대 메시지로 오인
- 권장:
  - `self-invite`와 `invalid-format` 분리

### 2.4 `getGroupMembersAction`의 RPC `invalid-format` 미매핑
- 영향 파일:
  - `src/actions/group/getGroupMembersAction.ts`
- 현재 동작:
  - `row.error_code === 'invalid-format'`를 잡지 않고 `server-error` 처리
- 위협:
  - 입력 오류가 서버 장애처럼 보임
- 권장:
  - `invalid-format` 분기 추가

### 2.5 not-found와 DB 오류를 동일 코드로 합침
- 영향 파일:
  - `src/actions/group/getGroupByIdAction.ts`
- 현재 동작:
  - `error || !data` 모두 `group-not-found`
- 위협:
  - 실제 장애 탐지/모니터링 왜곡
- 권장:
  - `error`는 `server-error`, `!data`는 `group-not-found` 분리

### 2.6 외부 API 예외가 typed error로 반환되지 않을 수 있음
- 영향 파일:
  - `src/actions/place.ts` (`searchPlacesAction`)
- 현재 동작:
  - `fetch/json` throw 경로에 catch 없음
- 위협:
  - `ActionResult`가 아닌 500으로 튈 가능성
- 권장:
  - `try/catch`로 `provider-error`/`server-error` 매핑 고정

### 2.7 에러 판별이 문자열 메시지에 의존
- 영향 파일:
  - `src/actions/appointment/create.ts`
- 현재 동작:
  - `error.code === 'P0001' && error.message === 'missing-group'`
- 위협:
  - DB 메시지 변경/현지화 시 매핑 붕괴
- 권장:
  - RPC 테이블 반환형(`ok/error_code`)으로 통일하거나 SQLSTATE/명시 코드 계약 강화

## 3) 잠재 위협(Candidate, 정책 판단 필요)

### 3.1 이메일 존재 확인 API의 계정 열거(enumeration) 가능성
- 영향 파일:
  - `src/actions/validation.ts`
- 위협:
  - rate limit 부재 시 대량 조회 악용 가능
- 권장:
  - 요청 제한/지연/감사 로그 도입

### 3.2 RPC payload 스키마 드리프트가 조용히 누락될 수 있음
- 영향 파일:
  - `src/actions/group/getGroupMembersAction.ts` (`mapRpcMembers`)
  - `src/actions/appointment/[appointmentId]/members/get.ts`
  - `src/actions/appointment/[appointmentId]/comments/list.ts`
- 현재 동작:
  - malformed row를 무시하고 성공 반환
- 위협:
  - 데이터 손실/카운트 불일치가 조용히 발생
- 권장:
  - 필수 필드 누락률 감시 로그 또는 strict decode 실패 시 `server-error`

### 3.3 `listReceivedInvitationsAction`의 `inviterId` 강제 빈 문자열 보정
- 영향 파일:
  - `src/actions/invitation/listReceived.ts`
- 현재 동작:
  - `inviter_id` null이면 `''`로 변환
- 위협:
  - 데이터 이상을 정상값처럼 은닉
- 권장:
  - nullable 유지 또는 이상 데이터 이벤트 로깅

## 4) 우선순위 제안

### P0 (배포 전 권장)
- 1.1, 1.2, 2.1, 2.4, 2.6

### P1
- 1.3, 2.2, 2.3, 2.5, 2.7

### P2
- 3.1, 3.2, 3.3

## 5) 메모
- 본 문서는 임시 기록(`temp.md`)이며 코드 변경은 아직 수행하지 않음.
