# ACTIONS

## Group Actions
- `createGroupAction`
- `searchGroupsAction`
- `joinGroupAction`
- `getGroupByIdAction`
- `searchUsersAction`
- `sendGroupInvitationAction`
- `getMyGroupsAction`

## Appointment Actions
- `listAppointmentsAction`
- `createAppointmentAction`
- `sendAppointmentInvitationAction`

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
