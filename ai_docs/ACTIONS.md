# ACTIONS

## Group Actions
- `createGroupAction`
- `searchGroupsAction`
- `searchGroupsWithCountAction`
- `joinGroupAction`
- `getGroupByIdAction`
- `searchUsersAction`
- `searchGroupInvitableUsersAction`
- `sendGroupInvitationAction`
- `getMyGroupsAction`

## Appointment Actions
- `listAppointmentsAction`
- `listAppointmentHistoryAction`
- `listReviewableAppointmentsAction`
- `listMyReviewsAction`
- `listMyCommentsAction`
- `getAppointmentReviewTargetAction`
- `submitPlaceReviewAction`
- `deleteMyReviewAction`
- `createAppointmentAction`
- `sendAppointmentInvitationAction`
- `searchAppointmentInvitableUsersAction`
- `searchAppointmentsByTitleAction`
- `getAppointmentDetailAction`
- `getAppointmentCommentsAction`
- `createAppointmentCommentAction`
- `updateAppointmentCommentAction`
- `deleteAppointmentCommentAction`
- `updateAppointmentAction`
- `updateAppointmentStatusAction`
- `getAppointmentMembersAction`
- `getAppointmentInvitationStateAction`

## Place Actions
- `searchPlacesAction`
- `getPlaceDetailAction`
- `listPlaceReviewsAction`

## User Actions
- `getUserData`
- `uploadProfileImageAction`
- `deleteProfileImageAction`
- `updateProfileAction`

## Validation Actions
- `checkEmailExists`

## Invitation Actions
- `listReceivedInvitationsAction`
- `respondToInvitationAction`

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

## listReviewableAppointmentsAction
- 입력: 없음
- 책임:
  - 로그인 사용자 식별
  - 사용자 참여 약속 중 종료된 약속만 조회
  - 취소된 약속 제외
  - 리뷰 대기 카드용 장소 리뷰 요약(평균/개수) 반환

## listAppointmentHistoryAction
- 입력: cursor?, limit?
- 책임:
  - 로그인 사용자 식별
  - 내가 참여(생성 포함)한 약속 중 종료된 약속만 조회
  - 취소된 약속 제외
  - 최근 종료순 정렬 + 커서 기반 페이지네이션
  - 히스토리 카드용 작성자/장소/인원/리뷰요약/리뷰작성가능여부 반환

## getAppointmentReviewTargetAction
- 입력: appointmentId
- 책임:
  - 로그인 사용자 식별
  - 리뷰 대상 약속 접근/권한 확인(생성자 또는 참여자)
  - 종료된 약속 + 취소 아님 조건 검증
  - 리뷰 페이지 표시용 약속/장소/평점 요약과 내 리뷰 작성 여부 반환

## listMyReviewsAction
- 입력: cursor?, limit?
- 책임:
  - 로그인 사용자 식별
  - 내가 작성한 리뷰 목록 조회(`user_places`)
  - 최근 수정순 커서 기반 페이지네이션
  - 리뷰 카드 표시용 장소명/점수/내용/수정일과 리뷰 수정 라우팅용 appointmentId 반환

## listMyCommentsAction
- 입력: cursor?, limit?
- 책임:
  - 로그인 사용자 식별
  - 내가 작성한 댓글 목록 조회(`appointment_comments`, 삭제 제외)
  - 최신 작성순 커서 기반 페이지네이션
  - 댓글 카드 표시용 약속 제목/댓글 내용/작성일과 약속 상세 라우팅용 appointmentId 반환

## submitPlaceReviewAction
- 입력: appointmentId, score(1~5), content(1~300)
- 책임:
  - 로그인 사용자 식별
  - 리뷰 대상 약속 접근/권한 확인(생성자 또는 참여자)
  - 종료된 약속 + 취소 아님 조건 검증
  - 기존 리뷰 존재 여부를 판단해 `user_places`에 신규 저장 또는 수정 저장

## deleteMyReviewAction
- 입력: placeId
- 책임:
  - 로그인 사용자 식별
  - 본인 리뷰(`user_places`)만 삭제(점수/리뷰 null 처리)

## searchPlacesAction
- 입력: query, latitude?, longitude?, radius?
- 책임:
  - 장소 검색 API 호출
  - 결과 정규화

## getPlaceDetailAction
- 입력: placeId
- 책임:
  - 로그인 사용자 식별
  - 장소 기본 정보 조회
  - 장소 리뷰 평균/개수 요약 반환

## listPlaceReviewsAction
- 입력: placeId, cursor?, limit?
- 책임:
  - 로그인 사용자 식별
  - 장소별 리뷰 목록 조회(`user_review`, appointment 기반 리뷰만)
  - 작성자 정보 결합
  - 최신 수정순 커서 기반 페이지네이션

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

## searchGroupInvitableUsersAction
- 입력: groupId, query
- 책임:
  - 로그인 사용자 식별
  - 초대자 그룹 멤버십 확인
  - 닉네임/이름 검색 결과에서 본인 제외
  - 이미 그룹 멤버인 사용자 제외
  - pending 그룹 초대 대상 포함
  - 검색 결과 내 pending 사용자 ID(`pendingInviteeIds`) 반환

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
- 입력: appointmentId, status(`pending` | `canceled`)
- 책임:
  - 로그인 사용자 식별
  - 약속 작성자 권한 확인
  - 약속 상태 전환(취소/재활성화)
  - 종료시간 지난 약속 상태 변경 차단

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

## getAppointmentInvitationStateAction
- 입력: appointmentId
- 책임:
  - 로그인 사용자 식별
  - 약속 접근 가능 여부 확인
  - 약속 멤버 userId 목록 반환
  - pending 상태의 약속 초대 대상 userId 목록 반환

## searchAppointmentInvitableUsersAction
- 입력: appointmentId, query
- 책임:
  - 로그인 사용자 식별
  - 약속 접근 가능 여부/초대 권한 확인
  - 취소/종료된 약속 검색 차단
  - 그룹 멤버 중 본인/기존 약속 멤버 제외 후 검색 결과 반환
  - pending 초대 대상은 결과에 포함하고 UI에서 `초대 완료` 상태로 표시하도록 위임

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

## listReceivedInvitationsAction
- 입력: cursor?, limit?
- 책임:
  - 로그인 사용자 식별
  - 내가 받은 초대(약속/그룹) 목록 조회(`pending`, `accepted`, `rejected`)
  - 초대한 사용자/대상 타이틀 포함 데이터 반환
  - 최신순 커서 기반 페이지네이션

## respondToInvitationAction
- 입력: invitationId, decision(`accepted` | `rejected`)
- 책임:
  - 로그인 사용자 식별
  - 본인 초대(`invitee_id`)만 처리
  - 수락 시 타입별 멤버 반영
    - 그룹 초대: `group_members` 등록
    - 약속 초대: `appointment_members` 등록
  - 초대 상태 업데이트(`pending` -> `accepted`/`rejected`)
  - Auth 메타데이터/비밀번호 동기화

## checkEmailExists
- 입력: email
- 책임:
  - 이메일 형식/정규화 검증
  - `check_email_exists` RPC 호출
  - 이메일 중복 여부(boolean) 반환
