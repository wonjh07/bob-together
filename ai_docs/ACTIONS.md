# ACTIONS

## Group Actions
- `createGroupAction`
- `searchGroupsAction`
- `searchGroupsWithCountAction`
- `joinGroupAction`
- `getGroupByIdAction`
- `searchUsersAction`
- `sendGroupInvitationAction`
- `getMyGroupsAction`

## Appointment Actions
- `listAppointmentsAction`
- `createAppointmentAction`
- `sendAppointmentInvitationAction`
- `searchAppointmentsByTitleAction`
- `getAppointmentDetailAction`
- `getAppointmentCommentsAction`
- `createAppointmentCommentAction`
- `updateAppointmentCommentAction`
- `deleteAppointmentCommentAction`
- `updateAppointmentAction`
- `updateAppointmentStatusAction`
- `getAppointmentMembersAction`

## User Actions
- `getUserData`
- `uploadProfileImageAction`
- `deleteProfileImageAction`
- `updateProfileAction`

## Validation Actions
- `checkEmailExists`

## getUserData
- 입력: 없음
- 책임:
  - 로그인 사용자 식별
  - `users` 테이블 기준 프로필 조회
  - Auth metadata fallback

## getMyGroupsAction
- 입력: 없음
- 책임:
  - 로그인 사용자 식별
  - 가입 그룹 목록 조회

## createAppointmentAction
- 입력: title, date, startTime, endTime, place, groupId
- 책임:
  - 권한/유효성 검증
  - 약속 생성
  - 멤버 기본 연결

## searchPlacesAction
- 입력: query, latitude?, longitude?, radius?
- 책임:
  - 장소 검색 API 호출
  - 결과 정규화

## createGroupAction
- 입력: groupName
- 책임:
  - 그룹 생성
  - 생성자 멤버십 부여

## joinGroupAction
- 입력: groupId
- 책임:
  - 그룹 가입 처리
  - 중복 가입 방지

## searchGroupsWithCountAction
- 입력: query, cursor?, limit?
- 책임:
  - 그룹명 검색(부분 일치)
  - 실제 그룹 인원 수 반환
  - 현재 사용자 가입 여부 반환
  - 커서 기반 페이지네이션

## searchAppointmentsByTitleAction
- 입력: query, cursor?, limit?
- 책임:
  - 약속 제목 검색(부분 일치)
  - 실제 약속 인원 수 반환
  - 커서 기반 페이지네이션

## getAppointmentDetailAction
- 입력: appointmentId
- 책임:
  - 로그인 사용자 식별
  - 약속 접근 권한 확인(그룹 멤버십)
  - 약속/장소/작성자 상세 데이터 조회
  - 실제 참여 인원 및 장소 리뷰 요약 반환

## updateAppointmentStatusAction
- 입력: appointmentId, status(`pending` | `confirmed` | `canceled`)
- 책임:
  - 로그인 사용자 식별
  - 약속 작성자 권한 확인
  - 약속 상태 전환(확정/확정취소/취소/재활성화)

## updateAppointmentAction
- 입력: appointmentId, title, date, startTime, endTime, place
- 책임:
  - 로그인 사용자 식별
  - 약속 작성자 권한 확인
  - 제목/일시 유효성 검증(종료시간 > 시작시간)
  - 장소 ID 또는 kakao_id 기반 장소 해석/업서트
  - 약속 제목/시간/장소 최종 수정

## getAppointmentMembersAction
- 입력: appointmentId
- 책임:
  - 로그인 사용자 식별
  - 약속 접근 가능 여부 확인
  - 약속 멤버 목록(프로필/닉네임/이름/역할) 반환

## getAppointmentCommentsAction
- 입력: appointmentId
- 책임:
  - 로그인 사용자 식별
  - 약속 접근 가능 여부 확인(그룹 멤버 기준)
  - 댓글 목록 + 댓글 수 반환

## createAppointmentCommentAction
- 입력: appointmentId, content
- 책임:
  - 로그인 사용자 식별
  - 약속 접근 가능 여부 확인(그룹 멤버 기준, 약속 참여 여부와 무관)
  - 댓글 저장 및 최신 댓글/댓글 수 반환

## updateAppointmentCommentAction
- 입력: appointmentId, commentId, content
- 책임:
  - 로그인 사용자 식별
  - 본인 댓글 여부 확인
  - 댓글 내용 수정 및 댓글/카운트 최신값 반환

## deleteAppointmentCommentAction
- 입력: appointmentId, commentId
- 책임:
  - 로그인 사용자 식별
  - 본인 댓글 여부 확인
  - 댓글 소프트 삭제(`is_deleted`, `deleted_at`) 및 댓글 수 최신값 반환

## uploadProfileImageAction
- 입력: file(FormData)
- 책임:
  - 이미지 파일 검증
  - Supabase Storage 업로드
  - `users.profile_image` 저장
  - 이전 프로필 이미지 파일 정리(새 업로드 성공 시)
  - Auth metadata(`profileImage`) best-effort 동기화

## deleteProfileImageAction
- 입력: 없음
- 책임:
  - `users.profile_image`를 `null`로 업데이트
  - 기존 프로필 이미지 파일 정리
  - Auth metadata(`profileImage`) best-effort 동기화

## updateProfileAction
- 입력: name, nickname, password(optional)
- 책임:
  - 입력값 검증
  - `users` 정보 업데이트
  - Auth 메타데이터/비밀번호 동기화

## checkEmailExists
- 입력: email
- 책임:
  - 이메일 형식/정규화 검증
  - `check_email_exists` RPC 호출
  - 이메일 중복 여부(boolean) 반환
