# DECISIONS

## validation/Postgrest raw error도 브라우저 디버그 콘솔까지 유지 (2026-03-06)
- Decision: `ActionError.error`는 `validation`을 포함한 모든 실패 타입에서 유지할 수 있게 하고, `dbError/createPostgrestErrorState`도 서버 로그용 raw DB 에러를 클라이언트 결과까지 함께 전달한다.
- Alternatives: 기존처럼 validation raw `issues`와 Postgrest raw error는 서버 내부/서버 로그에서만 유지
- Reason: request 에러 모달은 `message + errorType`만 보여주더라도, 브라우저 디버그 콘솔에서는 실제 validation issue와 DB 원본 에러를 빠짐없이 확인할 수 있어야 디버깅 속도가 유지된다.
- Scope:
  - `src/actions/_common/service-action.ts`
  - `src/libs/errors/request-error.ts`
  - `src/libs/errors/action-error.ts`
  - 관련 테스트 전반

## 앱 표준 요청 에러 분류 키를 `errorType`으로 통일 (2026-03-06)
- Decision: 사용자에게 표시되는 모든 요청 에러의 상위 분류 키는 `errorType`으로 통일하고, 값은 `validation`, `auth`, `conflict`, `not_found`, `permission`, `server` 중 하나만 사용한다. 단순 문자열 오류나 일반 `Error`도 UI에 표시될 때는 기본 `server` 분류를 부여한다.
- Alternatives: 기존 `errorCode` 명칭 유지, 문자열/일반 `Error`는 분류 없이 표시
- Reason: `rpcErrorCode`나 raw `error.code`는 원본 시스템 코드이고, UI 상위 분류와 의미 레벨이 달라 혼동을 만들고 있었다. 상위 분류는 `errorType`, 원본 세부 코드는 raw `error` 내부 보조 정보로 분리하는 편이 역할이 더 명확하다.
- Scope:
  - `src/types/result.ts`
  - `src/actions/_common/service-action.ts`
  - `src/libs/errors/{action-error.ts,request-error.ts}`
  - `src/hooks/useRequestError.ts`
  - `src/provider/request-error-provider.tsx`
  - `src/components/ui/RequestErrorModal.tsx`
  - 요청 에러 관련 테스트 전반

## query action 실행은 `runQueryAction`으로 통일하고 클라이언트 raw error는 whitelist만 전달 (2026-03-06)
- Decision: query option의 `action 호출 -> unwrapActionResult` 반복은 `runQueryAction(() => action(...), { fallbackMessage, emptyDataMessage?, select? })` helper로 통일한다. 또한 서버 액션이 클라이언트로 내려보내는 raw `error`는 환경과 무관하게 whitelist 필드(`name`, `message`, `code`, `status`, `details`, `hint`, `digest`, `rpcErrorCode`, `issues`, `fieldErrors`, `cause`)만 유지한다.
- Alternatives: 각 query 파일이 `unwrapActionResult`를 직접 호출하거나, development에서만 raw error 전체를 직렬화
- Reason: query 파일마다 같은 unwrap 보일러플레이트가 반복되고 있었고, raw error는 개발 환경에서도 stack이나 임의 메타데이터까지 지나치게 넓게 전달되고 있었다. query 실행 규칙을 helper 하나로 모으고, raw error를 항상 whitelist 기반으로 제한하는 편이 유지보수와 노출 통제가 더 명확하기 때문
- Scope:
  - `src/libs/errors/request-error.ts`
  - `src/libs/query/{appointmentQueries.ts,groupQueries.ts,placeQueries.ts,invitationQueries.ts}`
  - `src/actions/_common/service-action.ts`
  - 관련 테스트 전반

## 요청 에러 UI API는 `show/hide + useSync`로 통합 (2026-03-06)
- Decision: 요청 에러 모달 공개 API는 `showRequestError(input, options?)`, `hideRequestError()` 두 개와 query 상태 동기화용 `useSyncRequestError(...)`만 남긴다. `input`은 `string`, `ActionError`, `RequestError`, 일반 `Error`를 모두 허용하고, 모달 표시 정책은 항상 `message + errorCode` 하나로 통일한다.
- Alternatives: `openRequestError`, `presentRequestError`, `syncRequestError`를 계속 병행하거나, action/query/string 입력마다 별도 API를 유지
- Reason: 액션 실패, 단순 문구, 쿼리 실패는 사용자에게 같은 모달을 같은 방식으로 보여주는데도 입력 경로가 셋으로 갈라져 있어서 호출부와 dedupe/close 책임이 중복되고 있었다. 표시 API는 하나로 줄이고, query처럼 상태 변화에 따라 자동으로 열고 닫아야 하는 경우만 별도 훅으로 분리하는 편이 책임이 가장 명확하기 때문
- Scope:
  - `src/hooks/useRequestError.ts`
  - `src/provider/request-error-provider.tsx`
  - `src/components/ui/ListStateView.tsx`
  - `src/app/design/request-error-modal/page.tsx`
  - `src/app/**/*Client.tsx`
  - `src/hooks/usePlaceSearch.ts`
  - 관련 테스트 전반

## 요청 에러 presenter는 `presentRequestError`를 기본 경로로 쓰고 모달 close는 owner 기반으로 제한 (2026-03-06)
- Decision: `useRequestErrorPresenter`는 `openRequestError(message, { err })` 같은 이중 입력 대신 `presentRequestError(err, { fallbackMessage? })`를 기본 경로로 사용한다. 또한 전역 요청 에러 모달은 owner id를 함께 저장하고, presenter/query 동기화 경로는 자신이 연 모달만 닫을 수 있도록 `closeOwnedRequestError(ownerId)`를 사용한다. 초대 액션의 conflict 분기는 사용자 메시지 문자열이 아니라 `reason` 필드(`already_member`, `already_invited`)를 기준으로 처리한다.
- Alternatives: 기존 presenter 시그니처를 유지하고, 전역 모달 close는 무조건 닫기, 초대 UI는 계속 `result.message === '...'` 비교
- Reason: 표시 메시지와 에러 원본 메시지가 서로 다른 소스에서 오면 drift가 생기고, owner 없는 전역 modal close는 다른 화면이 연 모달을 닫는 버그를 만들기 쉽다. 또한 문자열 비교는 문구 수정에 취약하므로 conflict 세부 이유를 명시적 코드로 내려주는 편이 실무적으로 안전하기 때문
- Scope:
  - `src/hooks/useRequestErrorPresenter.ts`
  - `src/hooks/useRequestErrorModal.ts`
  - `src/provider/request-error-provider.tsx`
  - `src/types/result.ts`
  - `src/actions/_common/service-action.ts`
  - `src/actions/group/sendGroupInvitationAction.ts`
  - `src/actions/appointment/[appointmentId]/members/invite.ts`
  - `src/app/dashboard/(plain)/appointments/invitation/AppointmentInvitationClient.tsx`
  - `src/app/dashboard/(plain)/profile/groups/[groupId]/members/invitation/GroupMemberInvitationClient.tsx`
  - 관련 테스트 전반

## query/action UI 에러 계약은 하나로 두고 query는 `RequestError`만 사용 (2026-03-06)
- Decision: UI가 해석하는 표준 실패 계약은 `ActionError` 하나로 유지하고, React Query의 `throw` 경계에서는 `ActionQueryError` 같은 query 전용 계약 대신 `RequestError`가 같은 `message/errorCode/fieldErrors/error` 필드를 그대로 노출한다. `ListStateView`의 `errorPresentation="modal"` 경로는 로컬 모달 상태를 갖지 않고 `useRequestErrorPresenter`를 통해 전역 요청 에러 모달을 연다.
- Alternatives: query 전용 에러 계약을 별도로 유지하거나, query에서 plain object를 직접 throw
- Reason: action과 query가 같은 실패 정보를 다른 shape로 다시 표현하면서 `readUiError`, 로그 경로, 모달 경로가 모두 이중화되어 있었고, TanStack Query는 `Error` 기반 사용을 권장하므로 비즈니스 에러 계약은 하나로 두되 query 경계에서는 얇은 `Error` wrapper만 두는 편이 타입/도구 호환성과 단순성의 균형이 가장 좋기 때문
- Scope:
  - `src/libs/errors/request-error.ts`
  - `src/libs/errors/action-error.ts`
  - `src/hooks/useRequestErrorPresenter.ts`
  - `src/components/ui/ListStateView.tsx`
  - `src/components/ui/ListStateView.test.tsx`
  - `src/libs/errors/request-error.test.ts`
  - `src/hooks/useRequestErrorPresenter.test.ts`

## Zod validation 실패는 `createZodValidationErrorState`로 통일 (2026-03-06)
- Decision: 액션별로 `parsed.error.issues[0]`, `flatten().fieldErrors`, `error: { issues }`를 직접 조립하던 패턴을 제거하고, `createZodValidationErrorState({ requestId, error, fallbackMessage })`로 통일한다.
- Alternatives: 각 액션이 Zod 검증 실패를 개별 조립하거나, `createActionErrorState`의 저수준 조합을 계속 노출
- Reason: 같은 validation 에러 shape를 수십 개 액션이 중복 작성하고 있었고, 클라이언트 계약이 `validation + message + fieldErrors`로 이미 정해진 상태라 helper 하나로 수렴시키는 편이 호출부와 테스트를 가장 단순하게 만들기 때문
- Scope:
  - `src/actions/**/*Action.ts`
  - `src/actions/appointment/**/*.ts`
  - `src/actions/group/**/*.ts`
  - `src/actions/auth/**/*.ts`
  - `src/actions/invitation/**/*.ts`
  - `src/actions/place.ts`
  - 관련 액션 테스트 전반

## UI 에러 원본 필드를 `debug` 대신 `error`로 통일 (2026-03-06)
- Decision: 브라우저까지 운반하는 원본 에러 필드는 `debug`를 없애고 `error` 하나로 통일한다. UI가 사용하는 `message/errorCode/fieldErrors` 해석은 `readUiError()` 한 곳에서만 수행하고, 브라우저 콘솔 로그는 중첩된 `error`를 벗겨낸 원본 객체만 출력한다.
- Alternatives: `debug`를 별도 필드로 유지하면서 `error`와 병행하거나, 각 presenter/query 컴포넌트가 개별 shape를 직접 분기
- Reason: 현재 `error`와 `debug`가 모두 원본 DB/RPC 정보를 담아 중복이 심했고, UI 계층이 어떤 필드를 읽어야 하는지 다시 학습해야 했기 때문에, 원본 운반 필드와 UI 매핑 관문을 각각 하나로 줄이는 편이 가장 단순하기 때문
- Scope:
  - `src/types/result.ts`
  - `src/actions/_common/service-action.ts`
  - `src/libs/errors/action-error.ts`
  - `src/libs/query/actionQueryError.ts`
  - `src/app/design/request-error-modal/page.tsx`
  - 관련 액션 호출부와 테스트 전반

## 요청 에러 모달 상태를 Provider 단일 소스로 축소 (2026-03-06)
- Decision: 요청 에러 모달의 열림/닫힘 상태는 `RequestErrorProvider` 하나만 소유하고, `useRequestErrorModal`은 provider API를 그대로 노출하는 얇은 훅으로 유지한다. `useRequestErrorPresenter`의 cleanup close / openedByThisHookRef / provider dedupe는 제거한다.
- Alternatives: provider/context, modal hook, presenter가 각각 로컬 상태와 소유권 추적을 나눠 갖는 기존 구조 유지
- Reason: 현재 구조는 same error dedupe, Strict Mode cleanup, provider re-render가 서로 얽혀 모달이 자동으로 닫히거나 다시 열리는 버그를 만들었고, 이번 요구사항은 "클라이언트에서 연다, 닫기 누르면 닫힌다"만 만족하면 되므로 단일 상태 소유가 가장 명확하기 때문
- Scope:
  - `src/provider/request-error-provider.tsx`
  - `src/hooks/useRequestErrorModal.ts`
  - `src/hooks/useRequestErrorPresenter.ts`
  - `src/hooks/useRequestErrorPresenter.test.ts`
  - `src/provider/request-error-provider.test.tsx`

## action/query 원본 에러를 브라우저 콘솔에서 확인 가능하게 복구 (2026-03-06)
- Decision: `debug`를 `ActionError`/`ActionQueryError`까지 전달 가능한 공통 필드로 복구하고, 브라우저 콘솔 로그는 UI 공통 진입점(`useRequestErrorPresenter`, `ListStateView`)에서 남긴다.
- Alternatives: 서버 전용 로그만 유지하거나, 각 컴포넌트/각 액션에서 개별 `console.error`를 추가
- Reason: 액션 다수가 이미 `debug` 원본을 생성하고 있었지만 공통 타입에서 버려져 브라우저에서 확인할 수 없었고, query는 `unwrapActionResult()`에서 원본이 사라지고 있었기 때문에, 공통 레이어에서 보존하고 UI sink에서 한 번만 로그하는 편이 가장 적은 수정으로 전체 경로를 복구할 수 있기 때문
- Scope:
  - `src/types/result.ts`
  - `src/actions/_common/service-action.ts`
  - `src/libs/errors/action-error.ts`
  - `src/libs/query/actionQueryError.ts`
  - `src/hooks/useRequestErrorPresenter.ts`
  - `src/components/ui/ListStateView.tsx`
  - 관련 테스트 갱신

## 요청 에러 계약 최소화 + 디버그 레이어 제거 (2026-03-06)
- Decision: 클라이언트 요청 실패 계약을 `errorCode + message + fieldErrors`로 단순화하고, `requestId/debug/source/error/errorDetails` 중심의 중간 레이어를 제거한다.
- Alternatives: 기존 `service-action -> result -> action-error parser -> presenter/debug` 다단계 구조 유지
- Reason: 현재 구조는 같은 에러를 여러 레이어가 반복 해석해 보일러플레이트가 늘고 이해 비용이 커졌기 때문에, 서버는 DB/RPC 오류를 콘솔에만 남기고 클라이언트는 모달에서 `errorCode/message`만 읽도록 책임을 재정렬하는 편이 명확하기 때문
- Scope:
  - 서버 공통:
    - `src/actions/_common/service-action.ts`
    - `src/actions/_common/guards.ts`
    - `src/actions/_common/result.ts` 삭제
    - `src/actions/_common/action-log.ts` 삭제
  - 클라이언트 공통:
    - `src/types/result.ts`
    - `src/libs/errors/action-error.ts`
    - `src/libs/query/actionQueryError.ts`
    - `src/hooks/useRequestErrorPresenter.ts`
    - `src/components/ui/ListStateView.tsx`
    - `src/hooks/build-debug.ts` 삭제
    - `src/hooks/use-action-debug.ts` 삭제
  - 호출부 정리:
    - `src/actions/**/*.ts`의 최종 반환을 `toActionResult(state)`로 통일
    - `src/app/**`의 `matchesActionError` / `source` 옵션 제거
  - 검증:
    - `src/actions/_common/service-action.test.ts`
    - `src/libs/errors/action-error.test.ts`
    - `src/libs/query/actionQueryError.test.ts`
    - `src/hooks/useRequestErrorPresenter.test.ts`

## 약속 댓글 액션 묶음 ServiceAction 전환 (2026-03-05)
- Decision: 약속 댓글 도메인 액션(`create`, `update`, `delete`, `list`, `listMine`)을 `requireUserService + runServiceAction` 기반으로 전환한다.
- Alternatives: 댓글 액션은 기존 `parseOrFail + requireUser + actionError/actionSuccess` 패턴 유지
- Reason: 댓글 액션은 사용자 상호작용 빈도가 높고 권한 실패/입력 오류가 잦아, `requestId/errorCode/debug` 추적 일관성을 확보하는 효과가 즉시 크기 때문
- Scope:
  - `src/actions/appointment/[appointmentId]/comments/create.ts`
  - `src/actions/appointment/[appointmentId]/comments/update.ts`
  - `src/actions/appointment/[appointmentId]/comments/delete.ts`
  - `src/actions/appointment/[appointmentId]/comments/list.ts`
  - `src/actions/appointment/comment/listMine.ts`
  - `src/actions/appointment/[appointmentId]/comments/*.test.ts`
  - `src/actions/appointment/comment/listMine.test.ts`

## 약속 생성/수정/상태변경 액션 ServiceAction 전환 (2026-03-05)
- Decision: `createAppointmentAction`, `updateAppointmentAction`, `updateAppointmentStatusAction`를 `requireUserService + runServiceAction` 기반으로 전환해 mutation 에러 계약을 공통 메타(`requestId/errorCode/debug`)로 통일한다.
- Alternatives: 기존 `parseOrFail + requireUser + actionError/actionSuccess` 패턴 유지
- Reason: 약속 도메인 핵심 mutation은 UI에서 실패 대응 빈도가 높아, 에러 분류와 추적 식별자를 표준화하는 우선순위가 가장 높기 때문
- Scope:
  - `src/actions/appointment/create.ts`
  - `src/actions/appointment/[appointmentId]/update.ts`
  - `src/actions/appointment/[appointmentId]/updateStatus.ts`
  - `src/actions/appointment/create.test.ts`

## 약속 멤버 액션 묶음 ServiceAction 전환 (2026-03-05)
- Decision: 약속 멤버 도메인 액션(`join`, `leave`, `get`, `getInvitationState`)을 `requireUserService + runServiceAction` 기반으로 전환한다.
- Alternatives: 일부 액션만 전환하고 나머지는 기존 `parseOrFail + requireUser + actionError` 패턴 유지
- Reason: 동일 도메인(약속 멤버)에서만이라도 에러 표준(`requestId/errorCode/debug`)을 일관화해야 UI 분기와 운영 추적이 예측 가능해지기 때문
- Scope:
  - `src/actions/appointment/[appointmentId]/members/join.ts`
  - `src/actions/appointment/[appointmentId]/members/leave.ts`
  - `src/actions/appointment/[appointmentId]/members/get.ts`
  - `src/actions/appointment/[appointmentId]/members/getInvitationState.ts`
  - `src/actions/appointment/[appointmentId]/members/join.test.ts`

## 로그인/회원가입 액션 ServiceAction 전환 (2026-03-05)
- Decision: `loginAction`, `signupAction`을 `runServiceAction` 기반으로 전환하고, 인증 SDK 오류는 `legacyError + debug`로 정규화해 `requestId/errorCode` 추적 체계에 편입한다.
- Alternatives: 기존 `actionError/actionSuccess` 구현 유지
- Reason: 온보딩의 모든 인증 액션이 동일한 에러 계약(추적 ID, 코드 분류, dev debug)에 맞춰져야 UI/운영 로그에서 일관된 대응이 가능하기 때문
- Scope:
  - `src/actions/auth/loginAction.ts`
  - `src/actions/auth/signupAction.ts`

## 초대 대상 검색 액션 ServiceAction 전환 (2026-03-05)
- Decision: `searchGroupInvitableUsersAction`, `searchAppointmentInvitableUsersAction`를 `requireUserService + runServiceAction` 기반으로 전환해 인증/검증/DB 예외 처리와 메타(`requestId/errorCode/debug`)를 동일 규격으로 맞춘다.
- Alternatives: 기존 `requireUser + actionError/actionSuccess` 흐름 유지
- Reason: 같은 초대 플로우 내 액션들 간 에러 계약을 통일해야 UI 분기(`errorCode` 우선)와 추적(`requestId`)이 일관되게 동작하기 때문
- Scope:
  - `src/actions/group/searchGroupInvitableUsersAction.ts`
  - `src/actions/appointment/[appointmentId]/members/searchInvitees.ts`
  - `src/actions/appointment/[appointmentId]/members/searchInvitees.test.ts`

## 초대/가입 액션 ServiceAction 전환 + 테스트 출력 호환 유지 (2026-03-05)
- Decision: `joinGroupAction`, `sendGroupInvitationAction`, `sendAppointmentInvitationAction`를 `runServiceAction` 기반으로 전환하고, `result` 브리지(`actionSuccessWithRequestId`, `actionErrorWithMeta`, `serviceStateToActionError`)는 `test` 환경에서 기존 최소 응답 형태를 유지하도록 보정한다.
- Alternatives: 액션별로 `actionError/actionSuccess` 패턴을 유지하고 메타 필드만 점진 수동 추가
- Reason: 운영 런타임에서는 `requestId/errorCode/debug` 표준 메타를 일관되게 제공해야 하지만, 기존 단위 테스트의 회귀를 줄이기 위해 테스트 응답 shape은 호환 유지가 필요했기 때문
- Scope:
  - `src/actions/_common/result.ts`
  - `src/actions/group/joinGroupAction.ts`
  - `src/actions/group/sendGroupInvitationAction.ts`
  - `src/actions/appointment/[appointmentId]/members/invite.ts`
  - `src/actions/appointment/[appointmentId]/members/invite.test.ts`

## 요청 에러 Presenter에서 `errorCode` 우선 분기 + `requestId` 지원문구 표준화 (2026-03-05)
- Decision: UI가 `result.error` 문자열 직접 비교 대신 `useRequestErrorPresenter.matchesActionError`를 사용해 `errorCode` 우선 분기하고, 모달 메시지에는 `requestId`를 자동 포함한 지원 문구를 표준으로 사용한다.
- Alternatives: 화면별로 `result.error`를 계속 직접 비교하고, 필요 화면에만 수동으로 요청 ID 문구를 추가
- Reason: 에러 코드 표준화 전환 중 레거시 코드(`legacyError`)와 공존해야 하므로, 공통 Presenter에서 매칭/표시 규칙을 통일하는 편이 회귀 위험과 중복을 줄이기 때문
- Scope:
  - `src/hooks/useRequestErrorPresenter.ts`
  - `src/hooks/useRequestErrorModal.ts`
  - `src/app/(onboarding)/email-find/EmailFindForm.tsx`
  - `src/app/(onboarding)/reset-password/ResetPasswordForm.tsx`
  - `src/app/dashboard/(plain)/profile/groups/find/GroupFindClient.tsx`
  - `src/app/dashboard/(plain)/profile/groups/[groupId]/members/invitation/GroupMemberInvitationClient.tsx`
  - `src/app/dashboard/(plain)/appointments/invitation/AppointmentInvitationClient.tsx`
  - `src/app/dashboard/(nav)/search/_components/ui/GroupSearchResults.tsx`

## 서비스 액션 에러 공통 레이어 도입 (2026-03-05)
- Decision: `service-action`을 에러 표준(`requestId`, `errorCode`, `fieldErrors`, `debug`)의 단일 소스로 두고, 기존 `ActionResult(error/message)`와 병행 가능한 브리지 헬퍼를 추가한다.
- Alternatives: 기존 `actionError` 패턴을 유지한 채 액션별로 개별 확장 필드 추가
- Reason: 액션별 확장은 에러 계약 드리프트를 유발하므로, 공통 레이어를 먼저 안정화하고 도메인별로 점진 전환하는 것이 실무적으로 안전하기 때문
- Scope:
  - `src/actions/_common/service-action.ts`
  - `src/actions/_common/result.ts`
  - `src/actions/_common/guards.ts`
  - `src/hooks/use-action-debug.ts`
  - `src/actions/_common/auth-debug.ts`
  - auth 파일럿 전환:
    - `src/actions/auth/findEmailAction.ts`
    - `src/actions/auth/verifyResetPasswordIdentityAction.ts`
    - `src/actions/auth/resetPasswordByIdentityAction.ts`
  - `src/actions/auth/*.test.ts` (requestId/error 메타 허용)

## 레거시 액션 전역 메타 에러 부여 (2026-03-05)
- Decision: `actionError/actionSuccess` 기본 헬퍼가 런타임(dev/prod)에서 `requestId`와 표준 `errorCode`를 자동 부여하도록 확장한다. 단, `test` 환경은 기존 응답 형태를 유지한다.
- Alternatives: 도메인별 액션 파일을 전부 개별 수정해 메타 필드를 수동 추가
- Reason: `group/appointment` 도메인에 `actionError` 호출이 매우 많아(186+) 수동 전환은 비용/회귀 위험이 크기 때문에, 공통 헬퍼에서 일괄 적용하는 방식이 현실적이기 때문
- Scope:
  - `src/actions/_common/result.ts`
  - `src/app/(onboarding)/email-find/EmailFindForm.tsx`
  - `src/app/(onboarding)/reset-password/ResetPasswordForm.tsx`

## 온보딩 계정찾기/비밀번호 재설정 액션 RPC 전환 (2026-03-04)
- Decision: `findEmailAction`, `verifyResetPasswordIdentityAction`, `resetPasswordByIdentityAction`의 `users` 직접 조회를 RPC 기반 조회로 전환한다.
- Alternatives: 액션에서 `users` 테이블을 직접 `select`하는 기존 구현 유지
- Reason: 사전 인증(onboarding) 계정 식별 로직을 DB 함수로 고정해 액션 책임을 단순화하고, 테이블 직접 접근 경로를 줄이기 위함
- Scope:
  - `supabase/migrations/20260304093000_add_auth_identity_lookup_rpcs.sql`
  - `src/actions/auth/findEmailAction.ts`
  - `src/actions/auth/verifyResetPasswordIdentityAction.ts`
  - `src/actions/auth/resetPasswordByIdentityAction.ts`
  - `src/actions/auth/findEmailAction.test.ts`
  - `src/actions/auth/verifyResetPasswordIdentityAction.test.ts`
  - `src/actions/auth/resetPasswordByIdentityAction.test.ts`

## 요청 에러 표시 훅을 Presenter 계층으로 통일 (2026-03-01)
- Decision: 화면 컴포넌트는 `useRequestErrorModal` 직접 의존 대신 `useRequestErrorPresenter`를 기본 사용한다.
- Alternatives: 화면별로 `openRequestError/closeRequestError`를 직접 제어
- Reason: 요청 에러 표시 책임(표시/닫기/소유권)을 훅으로 모아 컴포넌트 가독성과 유지보수성을 높이기 위함
- Scope:
  - 공통 훅:
    - `src/hooks/useRequestErrorPresenter.ts` (호환 시그니처 `openRequestError/closeRequestError` + `syncRequestError` 제공)
    - `src/hooks/useRequestErrorModal.ts` (`RequestErrorOpenOptions` export)
  - 앱 전역 전환:
    - `src/app/**`의 서비스 컴포넌트에서 `useRequestErrorPresenter` 사용으로 치환
  - 동기화형 조회 에러 정리:
    - `PlaceDetailClient`
    - `AppointmentDetailClient`
    - `ReviewEditorClient`
    - `ReviewsWaitList`

## 요청 실패 UI를 공통 모달로 일원화 (2026-02-27)
- Decision: 폼 입력 검증 에러를 제외한 요청 실패 메시지는 인라인 텍스트 대신 공통 모달(`RequestErrorModal`)로 표시한다.
- Alternatives: 화면별 `helperText`, `errorMessage`, `errorBox` 인라인 노출 유지
- Reason: 요청 실패 메시지의 시각적 우선순위를 높이고, 화면마다 다른 에러 표현으로 인한 UX 편차를 줄이기 위함
- Scope:
  - 공통 UI/훅:
    - `src/components/ui/RequestErrorModal.tsx`
    - `src/components/ui/RequestErrorModal.css.ts`
    - `src/hooks/useRequestErrorModal.ts`
    - `src/components/ui/ListStateView.tsx` (`errorPresentation` 모달 모드 추가)
  - 1차 전환 화면:
    - 그룹 생성/검색
    - 그룹 멤버 초대 / 약속 멤버 초대
    - 약속 수정
    - 약속 댓글 요청 실패
    - 약속 생성/수정의 장소 검색 요청 실패
  - 2차 전환 화면 (조회/리스트 요청 실패):
    - 알림 목록, 그룹/댓글/리뷰/히스토리/작성 가능한 리뷰 목록
    - 검색 결과(약속/그룹), 장소 상세 리뷰 목록
    - 약속 상세/장소 상세/리뷰 에디터 조회 실패

## 함수 실행 권한 화이트리스트화 (2026-02-27)
- Decision: 앱 함수 실행 권한을 `anon`/`PUBLIC` 기본 허용에서 명시적 화이트리스트로 전환한다.
- Alternatives: 기존처럼 `GRANT ... TO anon` + `PUBLIC` 실행 권한 유지
- Reason: `SECURITY DEFINER` 함수는 내부 가드가 있어도 호출면 자체를 줄여야 오용/설정 누락 리스크를 낮출 수 있기 때문
- Scope:
  - `supabase/migrations/20260227013000_revoke_anon_function_execute.sql`
  - `supabase/migrations/20260227013100_revoke_public_function_execute.sql`
  - `anon`은 `check_email_exists(text)`만 유지

## RLS 자동 활성화 이벤트 트리거 연결 (2026-02-27)
- Decision: `public.rls_auto_enable()`를 `ddl_command_end` 이벤트 트리거(`rls_auto_enable_on_ddl`)에 연결한다.
- Alternatives: 새 테이블 추가 시마다 수동으로 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` 수행
- Reason: 신규 테이블 누락으로 인한 RLS 미적용 보안 리스크를 운영 절차가 아닌 DB 레벨 자동화로 줄이기 위함
- Scope:
  - `supabase/migrations/20260227012000_enable_rls_auto_event_trigger.sql`

## 사용자 스코프 SECURITY DEFINER 읽기 RPC 하드닝 (2026-02-27)
- Decision: 사용자 식별자(`p_user_id`)를 받는 `SECURITY DEFINER` 읽기 RPC에 `p_user_id = auth.uid()` 바인딩을 강제하고, `anon` 실행 권한을 제거한다.
- Alternatives: 기존처럼 액션 레벨 인증/파라미터 검증에 의존
- Reason: DB 함수 자체에서 호출자 컨텍스트를 강제해야 파라미터 위조/오용 가능성을 구조적으로 차단할 수 있기 때문
- Scope:
  - `supabase/migrations/20260227011000_secure_user_scoped_read_rpcs.sql`
  - 대상 RPC:
    - `get_appointment_detail_with_count`
    - `list_appointments_with_stats`
    - `list_appointments_with_stats_cursor`
    - `list_my_groups_with_stats`
    - `list_reviewable_appointments_with_stats`
    - `list_reviewable_appointments_with_stats_cursor`
    - `search_appointments_with_count`
    - `search_groups_with_count`

## 약속 멤버 목록 조회 권한을 그룹 멤버 기준으로 변경 (2026-02-26)
- Decision: `get_appointment_members_with_count` 접근 권한을 "약속 멤버"가 아닌 "해당 약속의 그룹 멤버" 기준으로 변경한다.
- Alternatives: 기존처럼 `appointment_members` 포함 사용자만 조회 허용
- Reason: 서비스 정책상 약속 참여 여부와 무관하게 같은 그룹 구성원은 약속 멤버 목록을 확인할 수 있어야 하기 때문
- Scope:
  - `supabase/migrations/20260226039000_allow_group_members_get_appointment_members_rpc.sql`
  - `src/actions/appointment/[appointmentId]/members/get.test.ts`

## 약속 생성 액션 단일 RPC화 (2026-02-26)
- Decision: `createAppointmentAction`의 다중 DB 호출(기본 그룹 조회 + 생성 RPC)을 단일 RPC 호출로 단순화한다.
- Alternatives: 액션에서 `group_members` 선조회 후 RPC 호출 유지
- Reason: 액션 책임을 입력 검증 + 인증 + 단일 RPC 매핑으로 제한하고, 기본 그룹 선택 규칙을 DB 함수에 고정해 일관성을 높이기 위함
- Scope:
  - `supabase/migrations/20260226038000_create_appointment_with_owner_member_default_group_rpc.sql`
  - `src/actions/appointment/create.ts`
  - `src/actions/appointment/create.test.ts`

## 내 리뷰 삭제 액션 RPC 전환 (2026-02-26)
- Decision: `deleteMyReviewAction`의 다중 쿼리(기존 리뷰 조회 + null 업데이트)를 단일 RPC(`delete_my_review_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `user_review` 순차 조회/업데이트 유지
- Reason: 리뷰 존재/내용 판정과 삭제 업데이트를 DB 함수로 고정해 액션 책임을 단순화하고 상태경합 가능성을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226037000_delete_my_review_transaction_rpc.sql`
  - `src/actions/appointment/review/delete.ts`
  - `src/actions/appointment/review/delete.test.ts`

## 약속 댓글 목록 조회 액션 RPC 전환 (2026-02-26)
- Decision: `getAppointmentCommentsAction`의 다중 조회 쿼리(접근 확인 + 댓글 목록/count)를 단일 RPC(`get_appointment_comments_with_cursor`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments` + `appointment_comments` 순차 조회 유지
- Reason: 키셋 커서/카운트/접근 검증 규칙을 DB 함수에 고정해 액션 책임을 단순화하고 조회 경로를 일관화하기 위함
- Scope:
  - `supabase/migrations/20260226036000_get_appointment_comments_with_cursor_rpc.sql`
  - `src/actions/appointment/[appointmentId]/comments/list.ts`
  - `src/actions/appointment/[appointmentId]/comments/list.test.ts`

## 그룹 멤버 조회 액션 RPC 전환 (2026-02-26)
- Decision: `getGroupMembersAction`의 다중 조회 쿼리(멤버십 접근 확인 + 멤버 목록/카운트)를 단일 RPC(`get_group_members_with_count`) 호출로 전환한다.
- Alternatives: 액션 내 `group_members` 순차 조회 유지
- Reason: 접근 검증과 멤버 집계를 DB 함수로 고정해 액션 책임을 단순화하고 조회 로직을 일관화하기 위함
- Scope:
  - `supabase/migrations/20260226035000_get_group_members_with_count_rpc.sql`
  - `src/actions/group/getGroupMembersAction.ts`
  - `src/actions/group/getGroupMembersAction.test.ts`

## 약속 멤버 조회 액션 RPC 전환 (2026-02-26)
- Decision: `getAppointmentMembersAction`의 다중 조회 쿼리(접근 확인 + 멤버 목록/카운트)를 단일 RPC(`get_appointment_members_with_count`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments`/`appointment_members` 순차 조회 유지
- Reason: 접근 검증과 멤버 집계 로직을 DB 함수에 고정해 액션 책임을 단순화하고 조회 경로를 일관화하기 위함
- Scope:
  - `supabase/migrations/20260226034000_get_appointment_members_with_count_rpc.sql`
  - `src/actions/appointment/[appointmentId]/members/get.ts`
  - `src/actions/appointment/[appointmentId]/members/get.test.ts`

## 약속 나가기 액션 RPC 전환 (2026-02-26)
- Decision: `leaveAppointmentAction`의 다중 쿼리(약속 상태 조회 + 멤버 삭제)를 단일 RPC(`leave_appointment_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments` 조회 후 `appointment_members delete` 순차 쿼리 유지
- Reason: 작성자/취소/종료 상태 검증과 멤버 삭제를 DB 함수로 원자화해 액션 책임을 단순화하고 상태경합을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226033000_leave_appointment_transaction_rpc.sql`
  - `src/actions/appointment/[appointmentId]/members/leave.ts`
  - `src/actions/appointment/[appointmentId]/members/leave.test.ts`

## 약속 상태 변경 액션 RPC 전환 (2026-02-26)
- Decision: `updateAppointmentStatusAction`의 다중 쿼리(약속 조회 + 상태 update)를 단일 RPC(`update_appointment_status_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `appointments` 조회/업데이트를 순차 쿼리로 유지
- Reason: 작성자 권한/종료 여부/상태 갱신을 트랜잭션 함수로 고정해 액션 책임을 단순화하고 상태경합을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226032000_update_appointment_status_transaction_rpc.sql`
  - `src/actions/appointment/[appointmentId]/updateStatus.ts`
  - `src/actions/appointment/[appointmentId]/updateStatus.test.ts`

## 그룹 탈퇴 액션 RPC 전환 (2026-02-26)
- Decision: `leaveGroupAction`의 다중 쿼리(멤버십 조회 + 삭제) 경로를 단일 RPC(`leave_group_transactional`) 호출로 전환한다.
- Alternatives: 액션 내 `group_members` 조회/삭제를 순차 쿼리로 유지
- Reason: 권한/역할 검증과 삭제를 DB 함수로 고정해 액션 로직을 단순화하고 상태경합 가능성을 줄이기 위함
- Scope:
  - `supabase/migrations/20260226031000_leave_group_transaction_rpc.sql`
  - `src/actions/group/leaveGroupAction.ts`
  - `src/actions/group/leaveGroupAction.test.ts`

## 프로필 이미지 DB 갱신 RPC 전환 (2026-02-26)
- Decision: 프로필 이미지 삭제/변경 액션의 DB 갱신 경로를 다중 테이블 쿼리(select + update)에서 액션당 단일 RPC로 전환한다.
- Alternatives: 기존처럼 액션에서 `users` select/update를 직접 수행
- Reason: 액션 책임을 인증/스토리지 처리 + 단일 RPC 호출로 단순화하고, DB 갱신 경로의 원자성과 규칙을 함수로 고정하기 위함
- Scope:
  - `supabase/migrations/20260226029000_clear_user_profile_image_transaction_rpc.sql`
  - `supabase/migrations/20260226030000_set_user_profile_image_transaction_rpc.sql`
  - `src/actions/user/deleteProfileImageAction.ts`
  - `src/actions/user/uploadProfileImageAction.ts`

## User 액션 인증 에러 코드 단일화 (2026-02-26)
- Decision: user 도메인 액션의 인증 실패 코드는 `user-not-found` 대신 공용 가드의 `unauthorized`로 통일한다.
- Alternatives: user 액션에서만 `user-not-found`를 별도 유지
- Reason: 인증 실패 의미를 액션 도메인마다 다르게 표현할 필요가 없고, 공용 가드로 표준화 시 분기/테스트 복잡도를 줄일 수 있기 때문
- Scope:
  - `src/actions/user/getUserData.ts`
  - `src/actions/user/updateProfileAction.ts`
  - `src/actions/user/deleteProfileImageAction.ts`
  - `src/actions/user/uploadProfileImageAction.ts`
  - `src/types/result.ts`
  - user action tests 3건

## 그룹 액션 인증 가드 공통화 (2026-02-26)
- Decision: 그룹 도메인 액션의 인증 확인 로직은 직접 `auth.getUser()`를 호출하지 않고 `requireUser()` 공용 가드를 사용한다.
- Alternatives: 각 액션에서 `createSupabaseServerClient + auth.getUser` 중복 구현 유지
- Reason: 인증 에러 처리 규칙을 한 곳으로 수렴해 코드 중복과 분기 드리프트를 줄이기 위함
- Scope:
  - `src/actions/group/getMyGroupsAction.ts`
  - `src/actions/group/searchUsersAction.ts`
  - `src/actions/group/getGroupMembersAction.ts`
  - `src/actions/group/leaveGroupAction.ts`
  - `src/actions/group/searchGroupsWithCountAction.ts`
  - `src/actions/group/listMyGroupsWithStatsAction.ts`

## React Query 사용자 스코프 키 도입 (2026-02-26)
- Decision: React Query 키에 `query scope`(예: `user:{userId}`)를 선택적으로 부여해 사용자 단위로 캐시를 분리한다.
- Alternatives: 인증 이벤트에서 전역 `queryClient.clear()`에만 의존
- Reason: 로그인/계정 전환/새로고침 경로에서 쿼리 키 자체가 분리되도록 만들어 교차 계정 캐시 노출 리스크를 구조적으로 줄이기 위함
- Scope:
  - `src/libs/query/queryScope.ts`
  - `src/provider/query-scope-provider.tsx`
  - `src/app/providers.tsx`
  - `src/app/layout.tsx`
  - `src/libs/query/*Keys.ts`, `src/libs/query/*Queries.ts`
  - dashboard/profile/search/detail 관련 query option 호출부 및 SSR prefetch 페이지

## Auth 이벤트 캐시 초기화 조건 보정 (2026-02-26)
- Decision: 전역 Query 캐시 초기화는 `SIGNED_OUT`는 즉시 수행하고, `SIGNED_IN`은 초기 세션 복원이 아닌 **실제 계정 전환 시점**에만 수행한다.
- Alternatives: 기존처럼 `SIGNED_IN`/`SIGNED_OUT` 모두 무조건 `queryClient.clear()`
- Reason: 새로고침/초기 세션 복원에서도 `SIGNED_IN`이 발생할 수 있어, 무조건 clear 시 무한스크롤 페이지가 빈 상태로 보이는 회귀가 발생하기 때문
- Scope: `src/app/providers.tsx`

## 약속 초대 전송 RPC 통합 (2026-02-26)
- Decision: `sendAppointmentInvitationAction`의 다중 검증/insert 흐름을 RPC(`send_appointment_invitation_transactional`) 단일 호출로 통합한다.
- Alternatives: 기존 액션에서 약속/멤버/그룹멤버/초대 중복을 순차 다중 쿼리로 검증 후 insert
- Reason: 초대 전송 경로의 권한/중복/상태 검증을 DB 함수에 고정해 원자성과 일관성을 높이고, 액션 코드 복잡도를 줄이기 위함
- Scope: `supabase/migrations/20260226018000_send_appointment_invitation_transaction_rpc.sql`, `src/actions/appointment/[appointmentId]/members/invite.ts`, `src/actions/appointment/[appointmentId]/members/invite.test.ts`

## 3회 이상 DB 호출 액션 RPC 통합 (2026-02-26)
- Decision: 3회 이상 DB 호출을 수행하던 그룹/약속/리뷰 액션을 액션당 1개 RPC 호출 + 결과 매핑 구조로 전환한다.
- Alternatives: 기존 액션에서 순차 다중 쿼리(검증/검색/집계/쓰기) 유지
- Reason: 액션 책임을 최소화(입력검증/인증/단일 RPC 호출/매핑)하고, 중간 단계 실패에 따른 상태 불일치와 성능 편차를 줄이기 위함
- Scope:
  - Migrations:
    - `supabase/migrations/20260226019000_join_group_transaction_rpc.sql`
    - `supabase/migrations/20260226020000_create_group_transaction_rpc.sql`
    - `supabase/migrations/20260226021000_send_group_invitation_transaction_rpc.sql`
    - `supabase/migrations/20260226022000_search_group_invitable_users_transaction_rpc.sql`
    - `supabase/migrations/20260226023000_search_appointment_invitable_users_transaction_rpc.sql`
    - `supabase/migrations/20260226024000_join_appointment_transaction_rpc.sql`
    - `supabase/migrations/20260226025000_get_appointment_invitation_state_transaction_rpc.sql`
    - `supabase/migrations/20260226026000_update_appointment_transaction_rpc.sql`
    - `supabase/migrations/20260226027000_get_appointment_review_target_transaction_rpc.sql`
    - `supabase/migrations/20260226028000_submit_place_review_transaction_rpc.sql`
  - Actions:
    - `src/actions/group/joinGroupAction.ts`
    - `src/actions/group/createGroupAction.ts`
    - `src/actions/group/sendGroupInvitationAction.ts`
    - `src/actions/group/searchGroupInvitableUsersAction.ts`
    - `src/actions/appointment/[appointmentId]/members/searchInvitees.ts`
    - `src/actions/appointment/[appointmentId]/members/join.ts`
    - `src/actions/appointment/[appointmentId]/members/getInvitationState.ts`
    - `src/actions/appointment/[appointmentId]/update.ts`
    - `src/actions/appointment/review/getTarget.ts`
    - `src/actions/appointment/review/submit.ts`

## 받은 초대 목록 조회 RPC 통합 (2026-02-26)
- Decision: `listReceivedInvitationsAction` 조회를 액션 내 조인/커서 조건 쿼리에서 RPC(`list_received_invitations_with_cursor`) 호출로 통합한다.
- Alternatives: 기존 액션에서 `invitations + users/groups/appointments` 조인과 키셋 커서 조건 문자열(`or`)을 직접 조합
- Reason: 커서 조건/정렬/제한(`limit + 1`) 규칙을 DB 함수에 고정해 페이지네이션 안정성을 높이고, 액션 코드 복잡도를 줄이기 위함
- Scope: `supabase/migrations/20260226017000_list_received_invitations_with_cursor_rpc.sql`, `src/actions/invitation/listReceived.ts`, `src/actions/invitation/listReceived.test.ts`

## 내 댓글 조회 RPC 통합 (2026-02-26)
- Decision: `listMyCommentsAction` 조회를 액션 내 조인/커서 조건 쿼리에서 RPC(`list_my_comments_with_cursor`) 호출로 통합한다.
- Alternatives: 기존 액션에서 `appointment_comments + appointments` 조인과 키셋 커서 조건 문자열(`or`)을 직접 조합
- Reason: 커서 조건/정렬/제한(`limit + 1`) 규칙을 DB 함수에 고정해 페이지네이션 안정성을 높이고, 액션 코드 복잡도를 줄이기 위함
- Scope: `supabase/migrations/20260226016000_list_my_comments_with_cursor_rpc.sql`, `src/actions/appointment/comment/listMine.ts`, `src/actions/appointment/comment/listMine.test.ts`

## 약속 생성 원자성 보장 RPC 전환 (2026-02-26)
- Decision: 약속 생성 흐름을 앱 단의 다중 쿼리(`places upsert` → `appointments insert` → `appointment_members insert`)에서 DB RPC 단일 트랜잭션(`create_appointment_with_owner_member`) 호출로 전환한다.
- Alternatives: 현재 순차 쿼리 유지 + 실패 시 보상 삭제(수동 rollback)
- Reason: 중간 단계 실패 시 owner 멤버가 없는 orphan appointment가 남는 일관성 위험을 제거하고, 생성 경로를 원자적으로 보장하기 위함
- Scope: `supabase/migrations/20260226014000_create_appointment_with_owner_member_rpc.sql`, `src/actions/appointment/create.ts`

## 초대 응답 원자성 보장 RPC 전환 (2026-02-26)
- Decision: 초대 수락/거절 흐름을 앱 단의 다중 쿼리(멤버 insert + 초대 상태 update)에서 DB RPC 단일 트랜잭션(`respond_to_invitation_transactional`) 호출로 전환한다.
- Alternatives: 현재 순차 쿼리 유지 + 부분 실패 시 사후 보정
- Reason: 수락 중간 단계 실패 시 `멤버 반영됨 + 초대 pending` 불일치 상태를 제거하고, 응답 처리의 일관성을 보장하기 위함
- Scope: `supabase/migrations/20260226015000_respond_invitation_transaction_rpc.sql`, `src/actions/invitation/respond.ts`

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

## User 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/user.ts` 단일 파일을 `src/actions/user/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `user.ts` 유지
- Reason: 프로필 관련 액션 증가로 책임 분리, 충돌 감소, 테스트/리뷰 범위 명확화
- Scope: `src/actions/user/*`, `src/actions/user.test.ts`

## Group 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/group.ts` 단일 파일을 `src/actions/group/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `group.ts` 유지
- Reason: 그룹 관련 액션 증가에 따른 파일 복잡도 축소, 책임 분리, 충돌 범위 최소화
- Scope: `src/actions/group/*`, `src/actions/group.ts`

## Appointment 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/appointment.ts` 단일 파일을 `src/actions/appointment/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `appointment.ts` 유지
- Reason: 약속 관련 액션 증가에 따른 파일 복잡도 축소, 책임 분리, 테스트/리뷰 범위 명확화
- Scope: `src/actions/appointment/*`, `src/actions/appointment.ts`, `src/actions/appointment.test.ts`

## Auth 액션 파일 분리 (2026-02-09)
- Decision: `src/actions/auth.ts` 단일 파일을 `src/actions/auth/*`(index + 액션별 파일 + shared) 구조로 분리
- Alternatives: 단일 `auth.ts` 유지
- Reason: 인증 액션 책임 분리 및 구조 일관성 확보(`user/group/appointment`와 동일 패턴)
- Scope: `src/actions/auth/*`, `src/actions/auth.ts`

## 그룹 선택 쿠키 로직 공통화 (2026-02-09)
- Decision: 그룹 선택 쿠키 read/write 공통 로직을 `src/libs/server/groupSelectionCookie.ts`로 추출하고, action/read 엔트리가 이를 재사용
- Alternatives: `src/actions/groupSelection.ts`와 `src/libs/server/groupSelection.ts`에 중복 유지
- Reason: 쿠키 키/옵션 드리프트 방지, 유지보수성 개선
- Scope: `src/libs/server/groupSelectionCookie.ts`, `src/actions/groupSelection.ts`, `src/libs/server/groupSelection.ts`

## 그룹 선택 로직 단일 파일 통합 (2026-02-09)
- Decision: `groupSelection` read/write 로직을 `src/libs/server/groupSelection.ts` 단일 파일로 통합하고 보조 파일 제거
- Alternatives: action/read/cookie 유틸 2~3개 파일 분리 유지
- Reason: 코드량 대비 파일 분산이 과해 탐색 비용이 커짐, 단일 파일이 현재 복잡도에 더 적합
- Scope: `src/libs/server/groupSelection.ts`, `src/provider/group-provider.tsx`, `src/app/dashboard/(nav)/page.tsx`, `src/app/dashboard/(plain)/appointments/create/page.tsx`, `src/actions/groupSelection.ts`, `src/libs/server/groupSelectionCookie.ts`

## 검색 결과 실제 인원수 조회 방식 (2026-02-10)
- Decision: 검색(그룹/약속)에서 실제 인원수를 위해 `security definer` RPC(`search_groups_with_count`, `search_appointments_with_count`)를 사용
- Alternatives: RLS 완화 후 일반 select/count, 더미 데이터 유지
- Reason: 실제 인원수 정확성을 유지하면서 멤버 테이블 row 전체 노출 범위를 불필요하게 넓히지 않기 위함
- Scope: `supabase/migrations/20260210162000_search_count_rpc.sql`, `src/actions/group/searchGroupsWithCountAction.ts`, `src/actions/appointment/list/search.ts`, `src/app/dashboard/(nav)/search/**`

## Appointment 액션 공통 가드/응답 패턴 적용 (2026-02-12)
- Decision: `appointment` 도메인 액션 전반에 `parseOrFail`, `requireUser`, `actionError/actionSuccess` 패턴을 통일 적용
- Alternatives: 액션별 수동 `safeParse`, `auth.getUser`, `{ ok: false/true }` 반환 유지
- Reason: 반복 코드 제거, 에러/응답 포맷 일관성 확보, 신규 액션 작성 시 실수 가능성 축소
- Scope: `src/actions/appointment/**` (comment 포함)

## Appointment 액션 파일명 단축 (2026-02-12)
- Decision: `appointment` 및 `appointment/comment` 액션 파일명에서 `*Action` 접미사를 제거하고 동작 중심의 짧은 파일명으로 통일
- Alternatives: 기존 긴 파일명 유지
- Reason: 도메인 폴더 자체가 컨텍스트를 제공하므로 파일명은 동작만 표현하는 편이 탐색성과 가독성에 유리
- Scope: `src/actions/appointment/**`, `src/actions/appointment/comment/**`, `src/actions/appointment/index.ts`

## Appointment 액션 계층 재구성 (2026-02-12)
- Decision: `appointment` 액션을 `create/list/detail/member/comment` 하위 도메인 폴더로 재구성하고, `_shared.ts`를 `types.ts`로 변경
- Alternatives: `appointment` 루트에 액션 파일을 평면으로 유지
- Reason: 목록/상세/멤버/댓글 유스케이스가 혼재되어 `index`/공통 타입의 역할이 흐려졌고, 하위 도메인 분리로 책임 경계를 명확히 하기 위함
- Scope: `src/actions/appointment/**`, `src/actions/appointment/index.ts`, `src/actions/appointment/types.ts`

## 약속 종료 상태 파생 처리 도입 (2026-02-13)
- Decision: DB `status` 원본값과 별개로 `ends_at` 기반 파생 상태(`ended`)를 UI에서 계산해 노출한다.
- Alternatives: DB에 `ended`를 즉시 물리 저장(배치/트리거), 기존 `pending/confirmed`만 노출 유지
- Reason: 운영 부하를 늘리는 스케줄러 없이도 사용자 화면에서 종료 상태를 즉시 일관되게 보장하고, 이후 `confirmed` 축소 마이그레이션을 단계적으로 진행하기 위함
- Scope: `src/utils/appointmentStatus.ts`, `src/app/dashboard/_components/AppointmentCard.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`

## 약속 상세 소유자 상태 전환 단순화 (2026-02-13)
- Decision: 약속 상세에서 소유자에게 `확정하기/확정 취소`를 제거하고 `초대하기 + 취소하기(+취소 상태에서 활성화)`만 제공한다.
- Alternatives: 기존 `확정/확정취소` 유지, 즉시 DB enum에서 `confirmed` 제거
- Reason: 상태 모델 단순화를 UI부터 선적용해 사용자 플로우를 안정화하고, DB/마이그레이션 변경은 후속 단계로 분리하기 위함
- Scope: `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`

## 약속 상태 정규화(`confirmed` → `pending`) (2026-02-13)
- Decision: 앱 계층에서 `confirmed`를 별도 상태로 노출하지 않고 `pending`으로 정규화하며, 종료 여부는 `ends_at` 기반 파생 상태(`ended`)로만 표현한다.
- Alternatives: `confirmed` 상태를 클라이언트까지 유지, 즉시 DB enum 제거 마이그레이션 동시 진행
- Reason: 상태 전이 복잡도를 즉시 줄이면서도 기존 데이터와 호환성을 유지하고, DB enum 정리는 운영 타이밍에 맞춰 분리하기 위함
- Scope: `src/actions/appointment/list.ts`, `src/actions/appointment/[appointmentId]/get.ts`, `src/actions/appointment/[appointmentId]/updateStatus.ts`, `src/utils/appointmentStatus.ts`, `src/app/dashboard/_components/AppointmentCard.tsx`

## appointment_status enum 축소 마이그레이션 (2026-02-13)
- Decision: DB 레벨에서도 `appointment_status`에서 `confirmed`를 제거하고 `pending/canceled`만 유지한다.
- Alternatives: enum은 유지하고 앱 레이어 정규화만 지속
- Reason: 앱/DB 상태 모델의 불일치를 제거하고, 추후 RLS/RPC/분석 쿼리에서 상태 분기를 단순화하기 위함
- Scope: `supabase/migrations/20260213174000_remove_confirmed_from_appointment_status.sql`

## 약속 상태 변경 진입점 단일화 (2026-02-13)
- Decision: 약속 `취소/활성화` 버튼을 상세 화면에서 제거하고 수정 화면으로 단일화한다.
- Alternatives: 상세 화면과 수정 화면에 상태 버튼 병행 노출
- Reason: 상태 변경 UX를 한 화면에 모아 캐시 동기화/버튼 상태 불일치 이슈를 줄이기 위함
- Scope: `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentDetailActions.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/edit/AppointmentEditClient.tsx`

## 프로필 리뷰 라우트 역할 분리 (2026-02-15)
- Decision: `/dashboard/profile/reviews`는 내 리뷰 목록 전용으로 전환하고, 리뷰 작성/수정은 `/dashboard/profile/reviews/[appointmentId]`로 분리한다.
- Alternatives: 기존처럼 `/dashboard/profile/reviews?appointmentId=...` 단일 페이지에서 목록/작성 역할을 혼합
- Reason: 목록과 편집의 책임을 분리해 URL 의미를 명확히 하고, 무한 스크롤/드롭다운 액션(수정/삭제) 유지보수를 단순화하기 위함
- Scope: `src/app/dashboard/(plain)/profile/reviews/**`, `src/actions/appointment/review/**`, `src/libs/query/appointmentQueries.ts`

## 약속 초대 상태 캐시 소유권 전환 (2026-02-16)
- Decision: 약속 초대 페이지의 `멤버 목록 + pending 초대 목록` 조회를 `useEffect + 2개 서버액션`에서 `React Query + 단일 서버액션(getAppointmentInvitationStateAction)`으로 전환한다.
- Alternatives: 기존처럼 `getAppointmentMembersAction`/`getPending...`를 클라이언트에서 병렬 호출
- Reason: 개발 모드 중복 요청(Strict Mode)과 상태 분산을 줄이고, 초대 성공/충돌 시점의 UI 상태 동기화를 Query Cache 단일 소스로 유지하기 위함
- Scope: `src/actions/appointment/[appointmentId]/members/getInvitationState.ts`, `src/libs/query/appointmentKeys.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/(plain)/appointments/invitation/AppointmentInvitationClient.tsx`

## 알림함 기반 초대 응답 플로우 도입 (2026-02-20)
- Decision: 대시보드 TopNav에 알림 진입점을 추가하고, `/dashboard/notifications`에서 받은 초대(그룹/약속)를 무한 스크롤로 조회/수락/거절 처리한다.
- Alternatives: 기존 개별 화면(그룹/약속 초대 화면)에서만 상태 확인, 알림함 없이 초대 상태를 분산 관리
- Reason: 초대 응답 동선을 한 화면으로 통합해 사용성/유지보수성을 높이고, 수락 시 타입별 멤버 반영(그룹/약속)을 일관된 액션으로 처리하기 위함
- Scope: `src/app/dashboard/_components/nav/TopNavigation.tsx`, `src/app/dashboard/(plain)/notifications/**`, `src/actions/invitation/**`, `src/libs/query/invitation*.ts`, `supabase/migrations/20260220120000_invitations_invitee_select_update_policy.sql`

## 리뷰 소유 단위 전환 (place → appointment) (2026-02-23)
- Decision: 리뷰 저장/수정/삭제/작성가능 여부 판단의 소유 단위를 `place_id`에서 `appointment_id`로 전환하고, 같은 장소라도 약속별 리뷰를 허용한다.
- Alternatives: 기존 place 단위 1리뷰 유지, place+user 단위로만 수정
- Reason: 실제 사용자 플로우(약속 단위 경험 기록)와 데이터 모델을 일치시키고, 히스토리/리뷰대기에서 같은 장소의 다른 약속 리뷰를 막는 문제를 해소하기 위함
- Scope: `supabase/migrations/20260223220000_review_domain_to_appointment.sql`, `src/actions/appointment/review/**`, `src/actions/appointment/history/list.ts`, `src/libs/query/appointmentKeys.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/(nav)/profile/_components/ReviewsWaitList.*`, `src/hooks/useHorizontalDragScroll.ts`

## 프로필 Plain 페이지/메뉴 UI 공통화 (2026-02-23)
- Decision: 프로필 plain 영역(그룹/히스토리/리뷰/댓글)의 반복 레이아웃 스타일을 공통 primitive로 통합하고, 카드의 more 메뉴를 `OverflowMenu` atom으로 추출한다.
- Alternatives: 각 페이지/카드별 개별 스타일 및 드롭다운 구현 유지
- Reason: 페이지 간 시각 일관성 확보, 폰트/간격 drift 방지, 외부 클릭 닫기/메뉴 상호작용 중복 코드 축소
- Scope: `src/styles/primitives/plainListPage.css.ts`, `src/components/ui/OverflowMenu.*`, `src/app/dashboard/(plain)/profile/**/page.css.ts`, `src/app/dashboard/(plain)/profile/comments/_components/MyCommentCard.*`

## 날짜/시간/상대시간/지역명 표시 유틸 단일화 (2026-02-23)
- Decision: 화면별로 중복 구현하던 날짜/시간/상대시간/주소 지역명 포맷 로직을 `src/utils/dateFormat.ts`, `src/utils/address.ts`로 통합하고 각 UI에서 공통 유틸을 사용한다.
- Alternatives: 컴포넌트별 로컬 포맷 함수 유지
- Reason: 표시 규칙 drift를 방지하고, 포맷 변경 시 수정 지점을 한 곳으로 줄여 유지보수성을 높이기 위함
- Scope: `src/utils/dateFormat.ts`, `src/utils/address.ts`, `src/app/dashboard/**` 내 appointment/profile/notification 관련 카드·상세 컴포넌트

## 날짜시간/장소메타 UI 컴포넌트 공통화 (2026-02-23)
- Decision: 반복되던 `아이콘+날짜/시간`과 `장소 평점+태그` UI를 `DateTimeMetaRow`, `PlaceRatingMeta` 공통 컴포넌트로 추출해 재사용한다.
- Alternatives: 각 화면에서 마크업/아이콘/구분자 직접 구성 유지
- Reason: 화면 간 UI 일관성을 높이고, 구조/표시 로직 변경 시 다수 파일 동시 수정 비용을 줄이기 위함
- Scope: `src/components/ui/DateTimeMetaRow*`, `src/components/ui/PlaceRatingMeta*`, `src/app/dashboard/**` 내 검색/리뷰대기/약속상세/약속수정/히스토리/리뷰에디터/대시보드 카드

## 사용자 아바타/이름 라인 공통화 (2026-02-23)
- Decision: 반복되던 `프로필 이미지 + 이름(+me) (+부가텍스트)` 표시를 `UserIdentityInline` 공통 컴포넌트로 통합한다.
- Alternatives: 화면별로 아바타/이름 마크업을 개별 유지
- Reason: 프로필 라인 UI를 통일하고, 아바타 크기/텍스트/`me` 표시 변경 시 수정 지점을 줄이기 위함
- Scope: `src/components/ui/UserIdentityInline*`, `src/app/dashboard/**` 내 그룹관리/멤버목록/약속상세 작성자/히스토리 작성자/알림 발신자/검색카드 작성자

## 버튼 스타일 소스 단일화 (2026-02-23)
- Decision: `LoginButton`/`SubmitButton`의 베이스 스타일을 `Buttons.css.ts` 독자 정의에서 `styles/primitives/actionButton.css.ts` 조합 방식으로 전환한다.
- Alternatives: 기존 `Buttons.css.ts`에서 중복 버튼 규칙 유지
- Reason: 버튼 컴포넌트마다 패딩/라운드/disabled 상태 규칙이 분산되는 것을 막고, 전역 버튼 톤/사이즈 수정 시 수정 지점을 줄이기 위함
- Scope: `src/components/ui/Buttons.tsx`, `src/components/ui/Buttons.css.ts`, `src/styles/primitives/actionButton.css.ts`

## user_review PK 구조 정규화 (2026-02-23)
- Decision: `user_review`의 레거시 복합 PK(`user_id`,`place_id`)를 제거하고, 단일 PK(`review_id`) + 부분 유니크 인덱스(`user_id`,`appointment_id`) 구조로 정규화한다.
- Alternatives: 기존 복합 PK 유지, 앱 로직에서만 우회 처리
- Reason: 같은 장소라도 약속별 리뷰를 허용하는 현재 도메인 규칙(appointment 단위)과 DB 제약을 일치시키고, `duplicate key ... user_places_pkey` 저장 실패를 제거하기 위함
- Scope: `supabase/migrations/20260223234000_user_review_pk_to_review_id.sql`, `public.user_review` 제약/인덱스

## PlainTopNav 래퍼 제거 및 직접 사용 (2026-02-24)
- Decision: `Appointment*TopNav` 래퍼 컴포넌트를 제거하고, 각 화면에서 `PlainTopNav`를 직접 사용한다.
- Alternatives: 화면별 래퍼를 유지한 채 `PlainTopNav` props만 위임
- Reason: 단순 위임 래퍼가 파일 탐색 비용만 늘리고 변경 지점을 분산시켜 유지보수성이 떨어졌기 때문
- Scope: `src/app/dashboard/(plain)/appointments/**` 내 상세/수정/멤버/초대 페이지, `src/components/ui/PlainTopNav.tsx`

## 드롭다운 베이스 컴포넌트 단일화 (2026-02-24)
- Decision: 드롭다운 류 UI의 open/close/outside-click 베이스를 `DropdownMenu`로 단일화한다.
- Alternatives: `OverflowMenu`/`ProfileDrop`/선택 드롭다운별 개별 구현 유지
- Reason: 외부 클릭 닫기/토글 로직 중복을 줄이고, 드롭다운 동작 일관성을 확보하기 위함
- Scope: `src/components/ui/DropdownMenu.tsx`, `src/components/ui/OverflowMenu.tsx`, `src/app/dashboard/_components/nav/ui/ProfileDrop.tsx`, `src/app/dashboard/_components/nav/TopNavigation.tsx`, `src/app/dashboard/_components/GroupsDropdown.tsx`, `src/app/dashboard/_components/PeriodFilter.tsx`

## 드롭다운/칩 시각 스타일 토큰 단일화 (2026-02-24)
- Decision: 드롭다운/칩 UI의 시각 규칙(보더, 라운드, 그림자, hover, disabled)을 `styles/primitives/dropdown.css.ts`, `styles/primitives/chip.css.ts`로 단일화한다.
- Alternatives: 컴포넌트별 `*.css.ts`에 개별 스타일 유지
- Reason: 메뉴/필터/프로필 드롭다운 간 시각적 드리프트를 줄이고, 향후 톤 변경 시 수정 지점을 primitive 레벨로 축소하기 위함
- Scope: `src/styles/primitives/dropdown.css.ts`, `src/styles/primitives/chip.css.ts`, `src/app/dashboard/_components/{PeriodFilter,GroupsDropdown,TypeFilter}.css.ts`, `src/components/ui/OverflowMenu.css.ts`, `src/app/dashboard/_components/nav/ui/ProfileDrop.css.ts`, `src/components/ui/ChipToggleGroup.tsx`

## 리뷰 대기 목록 쿼리 소유 정리 (2026-02-24)
- Decision: `/dashboard/profile/reviews/waitlist`는 히스토리 쿼리를 재사용하지 않고, 리뷰 대기 전용 쿼리(`reviewable`)를 직접 사용한다.
- Alternatives: `history` 쿼리 + 클라이언트 필터(`canWriteReview`) 유지
- Reason: 클라이언트 필터/빈 결과 재요청 루프를 제거해 네트워크 낭비를 줄이고, 화면 목적과 쿼리 소유를 일치시키기 위함
- Scope: `src/app/dashboard/(plain)/profile/reviews/waitlist/ProfileReviewWaitListClient.tsx`, `src/libs/query/appointmentQueries.ts`

## Mutation Invalidate 플랜 중앙화 (2026-02-24)
- Decision: 컴포넌트마다 분산된 `invalidateQueries` 나열을 도메인 helper 플랜으로 중앙화한다.
- Alternatives: 각 클라이언트 컴포넌트에서 invalidate 리스트를 직접 유지
- Reason: 누락/중복 invalidate를 줄이고, mutation 후 캐시 동기화 규칙을 단일 파일에서 관리하기 위함
- Scope: `src/libs/query/invalidateAppointmentQueries.ts`, `src/libs/query/invalidateGroupQueries.ts`, `src/libs/query/invalidateInvitationQueries.ts`, `src/app/dashboard/(plain)/**` mutation caller 컴포넌트

## 그룹 생성/멤버 초대 플로우 대시보드 단일화 (2026-02-25)
- Decision: 그룹 생성/멤버 초대의 기준 경로를 `dashboard/profile/groups/**`로 통합하고, 온보딩 `create/invitation` 개별 페이지는 제거한다.
- Alternatives: 온보딩(`/group/create`, `/group/invitation`)과 대시보드 멤버 관리 경로를 별도 구현으로 병행 유지
- Reason: 동일 기능의 중복 구현을 제거해 유지보수 복잡도를 낮추고, 그룹 관리-생성-초대를 하나의 정보 구조에서 일관되게 제공하기 위함
- Scope: `src/app/dashboard/(plain)/profile/groups/**`, `src/app/(onboarding)/group/create/**`, `src/app/(onboarding)/group/invitation/**`, `src/components/ui/PlainTopNav.tsx`

## 그룹 가입(검색/가입) 플로우 대시보드 단일화 (2026-02-25)
- Decision: 그룹 가입 플로우의 기준 경로를 `/dashboard/profile/groups/find`로 통합하고, 온보딩 `join` 계열 개별 페이지는 제거한다.
- Alternatives: 온보딩(`/group/join`, `/group/join/confirm`, `/group/join/complete`) 화면을 별도 유지
- Reason: 그룹 생성/초대와 마찬가지로 가입 플로우도 중복 구현을 제거해 그룹 도메인 진입점을 `profile/groups`로 단일화하기 위함
- Scope: `src/app/dashboard/(plain)/profile/groups/find/**`, `src/app/dashboard/(plain)/profile/groups/ProfileGroupsClient.tsx`, `src/app/(onboarding)/group/join/**`, `src/app/(onboarding)/group/page.tsx`

## Profile/Group 상단 레이아웃 반응형 안정화 (2026-02-25)
- Decision: 그룹 관리 상단 필터 영역을 줄바꿈 가능한 반응형 레이아웃으로 변경하고, plain 레이아웃의 오버플로우를 `Y축 자동 스크롤 + X축 숨김`으로 고정한다. 또한 프로필 빠른 링크는 공용 스택 컴포넌트 의존을 줄이고 로컬 마크업으로 고정한다.
- Alternatives: 기존 한 줄 고정 필터 레이아웃 + `overflow: scroll` 유지, 빠른 링크의 공용 컴포넌트 의존 유지
- Reason: 좁은 화면에서 칩/액션 버튼이 가로로 넘치며 가로 스크롤 상태로 보이는 문제를 제거하고, 공용 스타일 변경에 따른 화면별 시각 드리프트를 줄이기 위함
- Scope: `src/app/dashboard/(plain)/layout.css.ts`, `src/app/dashboard/(plain)/profile/groups/page.css.ts`, `src/app/dashboard/(nav)/profile/_components/ProfileQuickLinks.tsx`, `src/app/dashboard/(nav)/profile/_components/ProfileQuickLinks.css.ts`

## 저가치 공통 스타일 추상화 정리 (2026-02-25)
- Decision: 재사용 이점이 낮은 공통 UI/스타일 추상화는 제거하고, 단일 사용처는 로컬 마크업/로컬 스타일로 전환한다.
- Alternatives: 기존 공통 컴포넌트(`IconStackLabel`)와 alias-only 스타일 파일(`TypeFilter.css.ts`) 유지
- Reason: 공통 추상화가 많아질수록 호출부의 의도 파악이 어려워지고, 단일 사용처에서는 오히려 탐색 비용과 클래스 합성 복잡도만 증가하기 때문
- Scope: `src/app/dashboard/_components/nav/BottomNavigation.tsx`, `src/app/dashboard/_components/nav/BottomNavigation.css.ts`, `src/app/dashboard/_components/TypeFilter.tsx`, `src/app/dashboard/_components/TypeFilter.css.ts`, `src/components/ui/IconStackLabel.tsx`, `src/components/ui/IconStackLabel.css.ts`, `ai_docs/STYLE_GUIDE.md`

## 검색 인풋 컴포넌트 단일화 (2026-02-25)
- Decision: 검색 입력 행(`input + submit`)은 `src/components/ui/SearchInput.tsx` 공통 컴포넌트로 단일화하고, 화면별 라벨/헬퍼/검증 메시지는 로컬에서 유지한다.
- Alternatives: 검색 화면/그룹 찾기/초대/장소 검색별 로컬 검색 인풋 마크업 유지
- Reason: 동일한 검색 입력 UI가 여러 화면에 분산되어 스타일/상호작용 drift가 발생하므로, 입력 행만 공통화해 일관성을 확보하고 중복 유지보수 비용을 줄이기 위함
- Scope: `src/components/ui/SearchInput*`, `src/app/dashboard/(nav)/search/_components/SearchResultsClient.tsx`, `src/app/dashboard/(plain)/profile/groups/find/GroupFindClient.tsx`, `src/app/dashboard/(plain)/profile/groups/[groupId]/members/invitation/GroupMemberInvitationClient.tsx`, `src/app/dashboard/(plain)/appointments/invitation/AppointmentInvitationClient.tsx`, `src/app/dashboard/(plain)/appointments/create/_components/PlaceStep.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/edit/place/AppointmentEditPlaceClient.tsx`, `ai_docs/STYLE_GUIDE.md`

## 새약속 만들기 다음 액션 단일화 (2026-02-25)
- Decision: 새약속 멀티스텝의 다음 이동/검증은 각 step 내부 버튼이 아니라 `PlainTopNav` 우측 액션에서 중앙 처리한다.
- Alternatives: `GroupStep`/`TitleStep`/`DateTimeStep`/`PlaceStep`에서 `NextButton`을 유지하며 step별로 다음 이동 로직을 분산 유지
- Reason: 네비게이션 패턴을 상단바 기준으로 통일하고, step 이동 검증 로직을 한 곳에서 관리해 중복/드리프트를 줄이기 위함
- Scope: `src/app/dashboard/(plain)/appointments/create/MultiStepFormClient.tsx`, `src/app/dashboard/(plain)/appointments/create/_components/{GroupStep,TitleStep,DateTimeStep,PlaceStep}.tsx`, `src/app/dashboard/(plain)/appointments/create/_components/ui/NextButton.*`

## 히스토리 조회 RPC 통합 (2026-02-25)
- Decision: 프로필 히스토리 약속 조회를 다중 쿼리(`appointments` + `appointment_members` + `user_review`)에서 단일 RPC(`list_appointment_history_with_stats`) 호출로 통합한다.
- Alternatives: 기존 액션에서 3개 쿼리를 유지하고 앱 레이어에서 집계 처리
- Reason: 장소 리뷰 집계/내 리뷰 여부 판별을 앱에서 대량 row 처리하던 병목을 제거하고, 히스토리 페이지 요청당 DB round trip 수를 줄이기 위함
- Scope: `supabase/migrations/20260225213000_list_appointment_history_with_stats_rpc.sql`, `src/actions/appointment/history/list.ts`, `src/actions/appointment/history/list.test.ts`

## 장소 상세 조회 RPC 통합 (2026-02-25)
- Decision: 장소 상세 조회를 `places` + `user_review` 다중 쿼리에서 단일 RPC(`get_place_detail_with_stats`) 호출로 통합한다.
- Alternatives: 기존 액션에서 상세 조회와 리뷰 집계를 각각 조회하고 앱 레이어에서 평균/개수 계산
- Reason: 상세 진입 시 DB 왕복 횟수와 앱 레이어 집계 비용을 줄여 응답 시간을 안정화하기 위함
- Scope: `supabase/migrations/20260225223000_get_place_detail_with_stats_rpc.sql`, `src/actions/place.ts`, `src/actions/place.test.ts`

## 초대 검색 상태 조회 범위 축소 (2026-02-25)
- Decision: 그룹/약속 초대 검색 시 멤버/초대 상태 조회를 전체 그룹/약속 범위가 아니라 검색 후보 사용자 ID 집합 범위로 제한한다.
- Alternatives: 기존처럼 검색마다 `group_members`/`appointment_members`/`invitations`를 전체 조회 후 앱에서 필터
- Reason: 입력당 불필요한 row 스캔/전송을 줄여 대규모 그룹에서 검색 응답 지연을 완화하기 위함
- Scope: `src/actions/group/searchGroupInvitableUsersAction.ts`, `src/actions/appointment/[appointmentId]/members/searchInvitees.ts`, 관련 테스트 2건

## 알림 목록 페이지네이션 키셋 전환 (2026-02-25)
- Decision: 받은 초대 목록 조회를 `offset` 커서에서 `created_time + invitation_id` 키셋 커서로 전환한다.
- Alternatives: 기존 `offset` 기반 `range(offset, offset + limit)` 유지
- Reason: 페이지가 깊어질수록 커지는 offset 스캔 비용을 줄이고, 알림 이력 데이터 증가 시 응답 지연을 완화하기 위함
- Scope: `src/actions/invitation/listReceived.ts`, `src/actions/invitation/types.ts`, `src/actions/invitation/listReceived.test.ts`

## 내 댓글 목록 페이지네이션 키셋 전환 (2026-02-25)
- Decision: `listMyCommentsAction` 페이지네이션을 `offset` 커서에서 `created_at + comment_id` 키셋 커서로 전환한다.
- Alternatives: 기존 `offset` 기반 `range(offset, offset + limit)` 유지
- Reason: 내 댓글 데이터가 누적될 때 깊은 페이지 요청의 offset 스캔 비용을 줄여 응답 지연을 완화하기 위함
- Scope: `src/actions/appointment/comment/listMine.ts`, `src/actions/appointment/types.ts`, `src/actions/appointment/comment/listMine.test.ts`

## 장소 리뷰 목록 RPC 키셋 전환 (2026-02-25)
- Decision: 장소 리뷰 목록 조회를 액션 내 `offset` 쿼리에서 RPC(`list_place_reviews_with_cursor`) 기반 키셋 커서(`updated_at + review_id`)로 전환한다.
- Alternatives: 기존 `range(offset, offset + limit)` 유지
- Reason: 리뷰가 많은 장소에서 깊은 페이지 offset 스캔 비용을 줄이고, 서버 액션의 쿼리 조합 복잡도(`or` 필터 + 커서 조건)를 DB 함수로 단순화하기 위함
- Scope: `supabase/migrations/20260225235900_list_place_reviews_with_cursor_rpc.sql`, `src/actions/place.ts`, `src/actions/place.test.ts`

## 내 리뷰 목록 RPC 키셋 전환 (2026-02-25)
- Decision: `listMyReviewsAction` 조회를 액션 내 `offset` 쿼리에서 RPC(`list_my_reviews_with_cursor`) 기반 키셋 커서(`updated_at + review_id`)로 전환한다.
- Alternatives: 기존 `range(offset, offset + limit)` 유지
- Reason: 리뷰 데이터가 누적될수록 커지는 offset 스캔 비용을 줄이고, 클라이언트 페이지네이션 커서를 장소 리뷰/알림/댓글과 동일한 키셋 패턴으로 통일하기 위함
- Scope: `supabase/migrations/20260226001000_list_my_reviews_with_cursor_rpc.sql`, `src/actions/appointment/review/listMine.ts`, `src/actions/appointment/review/listMine.test.ts`, `src/actions/appointment/types.ts`

## 리뷰 가능 목록 RPC 키셋 전환 (2026-02-25)
- Decision: `listReviewableAppointmentsAction` 조회를 `offset` 기반 RPC에서 키셋 RPC(`list_reviewable_appointments_with_stats_cursor`)로 전환한다.
- Alternatives: 기존 `list_reviewable_appointments_with_stats(p_offset, p_limit)` 유지
- Reason: 리뷰 대기 데이터가 누적될 때 깊은 페이지 요청의 offset 스캔 비용을 줄이고, 프로필 리뷰 영역 페이지네이션 패턴을 키셋으로 통일하기 위함
- Scope: `supabase/migrations/20260226004000_list_reviewable_appointments_with_stats_cursor_rpc.sql`, `src/actions/appointment/review/list.ts`, `src/actions/appointment/review/list.test.ts`, `src/actions/appointment/types.ts`

## 대시보드 약속 목록 커서 안정화 (2026-02-25)
- Decision: 대시보드 약속 목록 조회 커서를 단일 `start_at`에서 복합 키셋(`start_at + appointment_id`)으로 전환한다.
- Alternatives: 기존 `start_at` 단일 커서 유지
- Reason: 동일 시작 시각(`start_at`)의 약속이 여러 건일 때 페이지 경계에서 누락/중복이 발생할 수 있어 정렬/커서 일관성을 보장하기 위함
- Scope: `supabase/migrations/20260226005000_list_appointments_with_stats_cursor_rpc.sql`, `src/actions/appointment/list.ts`, `src/actions/appointment/list.test.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/_components/AppointmentList.tsx`, `src/actions/appointment/types.ts`

## 프로필 히스토리 커서 안정화 (2026-02-25)
- Decision: 프로필 히스토리 조회 커서를 `offset`에서 복합 키셋(`ends_at + appointment_id`)으로 전환한다.
- Alternatives: 기존 `offset` 유지
- Reason: 히스토리 데이터 증가 시 깊은 페이지 offset 스캔 비용을 줄이고, 페이지네이션 기준을 대시보드/리뷰 목록과 동일한 키셋 패턴으로 통일하기 위함
- Scope: `supabase/migrations/20260226005500_list_appointment_history_with_stats_cursor_rpc.sql`, `src/actions/appointment/history/list.ts`, `src/actions/appointment/history/list.test.ts`, `src/actions/appointment/types.ts`

## 키셋 페이지네이션 인덱스 보강 (2026-02-25)
- Decision: 최근 전환한 키셋 페이지네이션 쿼리 패턴에 맞춰 `appointments`/`appointment_comments`/`invitations`/`user_review`에 복합(부분) 인덱스를 추가한다.
- Alternatives: 기존 인덱스 상태 유지(쿼리 플래너에만 의존)
- Reason: 키셋 커서 전환만으로는 대량 데이터에서 정렬+필터 비용이 남을 수 있어, 실제 실행 계획에서 인덱스 탐색을 유도해 응답 시간 편차를 줄이기 위함
- Scope: `supabase/migrations/20260226012000_add_keyset_pagination_indexes.sql`

## 인증 상태 전환 시 쿼리 캐시 전역 초기화 (2026-02-25)
- Decision: 앱 전역 `Providers`에서 Supabase auth 상태(`SIGNED_IN`/`SIGNED_OUT`)를 구독하고, 이벤트 시 React Query 캐시를 전체 초기화한다.
- Alternatives: 로그인/로그아웃 화면에서만 수동 `queryClient.clear()` 유지
- Reason: 특정 화면 경로를 거치지 않는 인증 상태 변화(세션 만료/재인증/탭 간 상태 변화 등)에서도 이전 계정 캐시가 노출되지 않도록 보장하기 위함
- Scope: `src/app/providers.tsx`

## 약속 상세 댓글 목록 키셋 전환 (2026-02-25)
- Decision: 약속 상세 댓글 조회를 전체 조회(`count exact`)에서 키셋 페이지네이션(`created_at + comment_id`) 기반 무한 스크롤 패턴으로 전환한다.
- Alternatives: 기존 `getAppointmentCommentsAction` 단일 조회 + 상세 페이지 SSR prefetch 유지
- Reason: 댓글 수가 많아질수록 커지는 응답/하이드레이션 payload와 브라우저 렌더 부담을 줄여 상세 페이지 초기 체감 성능을 안정화하기 위함
- Scope: `src/actions/appointment/[appointmentId]/comments/list.ts`, `src/libs/query/appointmentQueries.ts`, `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/AppointmentCommentsSection.tsx`, `src/app/dashboard/(plain)/appointments/[appointmentId]/page.tsx`, `src/actions/appointment/[appointmentId]/comments/list.test.ts`

## React Query 기본 동작 안정화 (2026-02-25)
- Decision: 전역 QueryClient 기본값을 `focus 재조회 비활성 + mount/reconnect 재조회 활성 + retry 0` 프로파일로 조정한다.
- Alternatives: 기본값 유지(`focus` 기반 자동 재조회, query retry=1)
- Reason: 사용 중 원치 않는 자동 재조회와 재시도로 인한 UI 흔들림/중복 토스트를 줄이고, 화면 재진입 시점에 예측 가능한 갱신으로 통일하기 위함
- Scope: `src/libs/query/clientQueryClient.ts`

## 키셋 커서 datetime 오프셋 허용 (2026-02-25)
- Decision: 키셋 페이지네이션 커서의 datetime 스키마를 `z.string().datetime({ offset: true })`로 통일한다.
- Alternatives: 기본 `datetime()` 유지
- Reason: Postgres timestamptz 문자열(`+00:00` 오프셋 포함)을 기본 `datetime()`가 거부해 `유효한 커서 정보가 아닙니다.` 오류가 발생하는 문제를 방지하기 위함
- Scope: `src/actions/appointment/review/list.ts`, `src/actions/appointment/review/listMine.ts`, `src/actions/appointment/history/list.ts`, `src/actions/appointment/comment/listMine.ts`, `src/actions/appointment/[appointmentId]/comments/list.ts`, `src/actions/invitation/listReceived.ts`, `src/actions/place.ts`

## 댓글 mutation 캐시 패치 우선 전략 (2026-03-02)
- Decision: 약속 상세 댓글 작성/삭제 후 `appointmentKeys.listRoot()` 전체 invalidate를 제거하고, 댓글 목록/약속 목록 캐시를 `setQueryData`/`setQueriesData`로 부분 패치한다.
- Alternatives: 기존처럼 댓글 mutation마다 루트 단위 invalidate로 전체 목록 재조회
- Reason: 댓글 1건 변경이 전체 목록 쿼리 재요청으로 확산되는 비용을 줄이고, 화면 체감 반응성과 네트워크 효율을 동시에 개선하기 위함
- Scope: `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/useAppointmentCommentsController.ts`, `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/commentCache.ts`

## 댓글 정렬 책임 단일화 (2026-03-02)
- Decision: 댓글 정렬 기준을 서버 액션(`desc`)으로 단일화하고, 클라이언트에서 페이지별 `reverse()`를 제거한다.
- Alternatives: 서버(`asc`) + 클라이언트 `reverse()` 이중 변환 유지
- Reason: 페이지당 배열 복제/역순 연산을 줄여 렌더 비용을 낮추고, 정렬 책임을 한 계층으로 고정해 유지보수 혼선을 줄이기 위함
- Scope: `src/actions/appointment/[appointmentId]/comments/list.ts`, `src/app/dashboard/(plain)/appointments/[appointmentId]/_components/useAppointmentCommentsController.ts`, `src/actions/appointment/[appointmentId]/comments/list.test.ts`

## 리뷰 액션 공통 에러 규격 전환 (2026-03-05)
- Decision: 리뷰 액션(`getTarget`, `submit`, `delete`, `list`, `listMine`)을 `runServiceAction` + `requireUserService` 기반으로 통일하고, 최종 응답은 `actionSuccessWithRequestId`/`serviceStateToActionError` 경유로 반환한다.
- Alternatives: 기존 `parseOrFail` + `requireUser` + `actionError/actionSuccess` 패턴 유지
- Reason: 인증/검증/서버 예외 처리와 `requestId`/`errorCode` 메타데이터를 리뷰 도메인에서도 동일 규격으로 제공해 UI/디버깅/로깅 규칙을 일관화하기 위함
- Scope: `src/actions/appointment/review/getTarget.ts`, `src/actions/appointment/review/submit.ts`, `src/actions/appointment/review/delete.ts`, `src/actions/appointment/review/list.ts`, `src/actions/appointment/review/listMine.ts`, `src/actions/appointment/review/*.test.ts`

## 그룹 검색(카운트 포함) 액션 공통 에러 규격 전환 (2026-03-05)
- Decision: `searchGroupsWithCountAction`을 `runServiceAction + requireUserService` 기반으로 전환하고, 응답 브리지는 `actionSuccessWithRequestId/serviceStateToActionError`를 사용한다.
- Alternatives: 기존 `parseOrFail + requireUser + actionError/actionSuccess` 패턴 유지
- Reason: 그룹 검색 도메인도 동일한 `requestId/errorCode/debug` 표준을 따르도록 맞춰 UI 에러 분기와 운영 추적 일관성을 높이기 위함
- Scope: `src/actions/group/searchGroupsWithCountAction.ts`, `src/actions/group/searchGroupsWithCountAction.test.ts`

## 잔여 액션 공통 에러 규격 전면 전환 (2026-03-05)
- Decision: 남아 있던 레거시 액션(`group`, `invitation`, `appointment`, `user`, `place`, `validation`, `auth/logout`)을 `runServiceAction`/`requireUserService` 기반으로 모두 전환하고, 최종 응답 브리지는 `actionSuccessWithRequestId`/`serviceStateToActionError`로 통일한다.
- Alternatives: 레거시 액션 일부(`public 조회`, `유틸성 액션`)를 기존 `actionError/actionSuccess` 패턴으로 유지
- Reason: 액션 계층 전체에서 `requestId/errorCode/debug` 메타와 에러 분류 규약을 동일하게 강제해야 UI 표시/운영 추적/디버깅 플로우를 일관되게 유지할 수 있기 때문
- Scope:
  - `src/actions/group/{createGroupAction,findGroupByNameAction,getGroupByIdAction,getGroupMembersAction,getMyGroupsAction,leaveGroupAction,listMyGroupsWithStatsAction,searchGroupsAction,searchUsersAction}.ts`
  - `src/actions/invitation/{listReceived,respond,hasPending}.ts`
  - `src/actions/appointment/{list,search}.ts`
  - `src/actions/appointment/history/list.ts`
  - `src/actions/appointment/[appointmentId]/get.ts`
  - `src/actions/user/{getUserData,updateProfileAction,deleteProfileImageAction,uploadProfileImageAction}.ts`
  - `src/actions/place.ts`
  - `src/actions/validation.ts`
  - `src/actions/auth/logoutAction.ts`
  - 위 변경 파일들의 대응 테스트 파일들

## 레거시 가드 헬퍼 제거 (2026-03-05)
- Decision: 액션 전환 완료 이후 미사용 상태가 된 `parseOrFail`, `requireUser`, `parseOrFailService`를 `src/actions/_common/guards.ts`에서 제거하고 `requireUserService` 단일 경로만 유지한다.
- Alternatives: 하위 호환을 위해 레거시 헬퍼를 코드에 남겨둠
- Reason: 더 이상 사용하지 않는 API를 유지하면 신규 코드가 레거시 경로로 회귀할 수 있어, 가드 레이어를 단일 표준 경로로 강제하기 위함
- Scope: `src/actions/_common/guards.ts`

## 결과 브리지 레거시 헬퍼 제거 (2026-03-05)
- Decision: 전역 액션 전환이 끝난 시점에서 `src/actions/_common/result.ts`의 미사용 레거시 헬퍼(`actionError`, `actionSuccess`, `actionErrorWithMeta`)를 제거하고 `actionSuccessWithRequestId` + `serviceStateToActionError`만 유지한다.
- Alternatives: 추후 가능성을 이유로 레거시 헬퍼를 남겨둠
- Reason: 공통 결과 레이어의 API 표면을 줄여 회귀 경로를 제거하고, 신규 액션이 표준 브리지 경로만 사용하도록 강제하기 위함
- Scope: `src/actions/_common/result.ts`

## 공통 에러 계약 유닛 테스트 추가 (2026-03-05)
- Decision: `service-action/result` 공통 헬퍼에 대해 requestId 부여, legacy 에러 매핑, 예외 처리(NEXT_REDIRECT 재던짐)와 test 환경 메타 숨김 동작을 검증하는 유닛 테스트를 추가한다.
- Alternatives: 도메인 액션 테스트만으로 간접 검증 유지
- Reason: 공통 레이어 회귀 시 전체 액션에 광범위한 영향이 발생하므로, 핵심 계약을 단위 테스트로 직접 고정해 리팩토링 안전성을 높이기 위함
- Scope: `src/actions/_common/service-action.test.ts`, `src/actions/_common/result.test.ts`

## 에러 키 호환 경로 축소 + 운영 로그 표준화 (2026-03-05)
- Decision: 응답 표면에서 `legacyError`를 제거하고 내부 호환 필드는 `errorKey`로 한정해 유지한다. UI 분기는 `errorCode` 중심으로 통일하고, 서버 액션 로그는 `requestId + errorCode + action + debug` 구조를 `logActionError` 헬퍼로 표준화한다.
- Alternatives: UI에서 기존 `legacyError`(또는 동급 fallback 키) 분기를 계속 유지하고, 액션별 `console.error` 포맷을 개별 관리
- Reason: 사용자 노출 계약을 단순화(`errorCode/message/fieldErrors`)하고, 운영 시 장애 추적 키를 단일 스키마로 맞춰 검색/분석 비용을 줄이기 위함
- Scope: `src/actions/_common/{service-action.ts,result.ts,action-log.ts}`, `src/actions/auth/logoutAction.ts`, `src/actions/{place.ts,validation.ts}`, `src/actions/group/createGroupAction.ts`, `src/actions/appointment/list.ts`, `src/actions/user/{deleteProfileImageAction.ts,uploadProfileImageAction.ts}`, `src/hooks/{useRequestErrorPresenter.ts,useRequestErrorModal.ts}`, `src/types/result.ts`, `src/app/**/*`

## legacy errorKey 경로 완전 제거 (2026-03-05)
- Decision: 서버 액션 실패 계약을 `ServiceErrorCode` 단일 축(`validation/auth/conflict/not_found/permission/server`)으로 고정하고, `createLegacyActionErrorState`, `mapLegacyErrorCode`, `errorKey` 기반 분기/응답을 전면 제거한다.
- Alternatives: `errorKey`를 내부 호환 필드로 계속 유지하며 단계적 제거
- Reason: 액션 구현/테스트/UI가 모두 동일한 에러 코드 집합을 사용해야 분기 규칙이 단순해지고, 도메인별 문자열 코드 누적에 따른 회귀 위험을 줄일 수 있기 때문
- Scope:
  - `src/actions/_common/{service-action.ts,result.ts}`
  - `src/types/result.ts`
  - `src/actions/**/*` (모든 액션의 `createActionErrorState({ code })` 정규화 및 `serviceStateToActionError(state)` 단일 브리지화)
  - `src/actions/**/*/*.test.ts`, `src/hooks/useEmailValidation.test.ts` (기대 에러 코드 `ServiceErrorCode` 기준으로 갱신)

## Debug 표시 경로 분리 (2026-03-05)
- Decision: 사용자 모달(`RequestErrorModal`)에는 사용자 메시지만 표시하고, 개발용 디버그 정보는 `useActionDebug` 훅으로 콘솔에만 출력한다. 디버그 payload 생성은 `buildDebug` 공통 함수로 일원화한다.
- Alternatives: 모달에 `[debug]` 블록을 유지하면서 콘솔 로그를 보조로만 사용
- Reason: 사용자 노출 메시지와 개발자 진단 정보를 명확히 분리해 UX를 단순화하고, 디버그 출력 형식을 한 곳에서 관리해 유지보수 비용을 줄이기 위함
- Scope: `src/hooks/{build-debug.ts,use-action-debug.ts,useRequestErrorPresenter.ts,useRequestErrorModal.ts}`, `src/components/ui/RequestErrorModal.tsx`

## devError 유틸 제거 (2026-03-05)
- Decision: 개발환경에서 사용자 메시지에 디버그 문자열을 덧붙이던 `withDevErrorDetails`(`src/actions/_common/devError.ts`)를 제거하고, 디버그 정보는 액션의 `debug` 필드 + `useActionDebug` 콘솔 경로로만 전달한다.
- Alternatives: `devError`를 유지해 일부 액션에서 메시지 기반 디버그 표시를 병행
- Reason: 사용자 메시지와 개발자 진단 정보를 분리한다는 최신 에러 처리 기준과 충돌하며, 동일 정보가 중복 경로로 관리되어 회귀 가능성이 높기 때문
- Scope: `src/actions/group/createGroupAction.ts`, `src/actions/user/uploadProfileImageAction.ts`, `src/actions/_common/devError.ts`

## 에러 분기/디버그 흐름 정합성 보강 (2026-03-05)
- Decision: `matchesActionError`를 엄격 매칭으로 변경해 기대 조건이 있을 때 실제 값이 없으면 매칭 실패로 처리한다. `runServiceAction`은 예외 catch 시 `logActionError`를 공통 호출해 최소 운영 추적 로그(`requestId/errorCode/action/debug`)를 보장한다. 또한 `useRequestErrorModal`은 UI 옵션(`title/closeLabel`)만 책임지고 `err/source`는 `useRequestErrorPresenter` 전용으로 분리한다.
- Alternatives: 느슨한 매칭(`actual` 미존재 시 true) 유지, 액션별 수동 로깅만 유지, 모달 훅 옵션에 `err/source`를 계속 포함
- Reason: UI 오분기(conflict/not_found 오탐)와 운영 로그 누락 리스크를 줄이고, 훅 API 책임을 명확히 분리해 유지보수성을 높이기 위함
- Scope: `src/hooks/{useRequestErrorPresenter.ts,useRequestErrorModal.ts,useRequestErrorPresenter.test.ts,use-action-debug.test.ts,build-debug.test.ts}`, `src/actions/_common/{service-action.ts,service-action.test.ts}`, `src/actions/group/{createGroupAction.ts,joinGroupAction.ts}`

## 요청 에러 표시 흐름 단순화 (2026-03-05)
- Decision: 요청 에러 처리 흐름을 `클라이언트 -> useRequestErrorPresenter -> (모달 + 콘솔)` 단일 경로로 단순화한다. presenter 내부의 `debugSnapshot` 상태와 effect 기반 로그를 제거하고, 에러 발생 시 `logActionDebug`를 즉시 호출한다. 모달에는 사용자 메시지와 `errorCode`를 함께 표시한다.
- Alternatives: 기존처럼 presenter 내부 state/effect로 디버그 스냅샷을 거쳐 로그 출력, 모달에는 메시지만 표시
- Reason: 디버그 출력 경로를 직관적으로 단순화해 읽기/추적 비용을 줄이고, 사용자/개발자 관점에서 필요한 정보(메시지/코드 vs 전체 디버그)를 명확히 분리하기 위함
- Scope: `src/hooks/{useRequestErrorPresenter.ts,use-action-debug.ts,useRequestErrorModal.ts}`, `src/provider/request-error-provider.tsx`, `src/components/ui/{RequestErrorModal.tsx,RequestErrorModal.css.ts}`, `src/hooks/{use-action-debug.test.ts,useRequestErrorPresenter.test.ts}`

## Query 에러를 Action 에러 스키마로 정규화 (2026-03-05)
- Decision: React Query `queryFn`에서 액션 결과 실패를 `Error` 문자열로 재포장하지 않고, `ActionQueryError`(`requestId/errorCode/debug` 포함)로 정규화한다. 또한 `useRequestErrorPresenter`는 액션 메타데이터가 있는 경우에만 콘솔 디버그를 출력한다.
- Alternatives: query 계층에서 기존 `throw new Error(...)` 유지 + presenter에서 모든 에러를 콘솔 출력
- Reason: query 경로에서도 모달/디버그 입력 스키마를 액션과 동일하게 맞춰 `errorCode/requestId` 유실 문제를 제거하고, 일반 런타임 에러는 모달 중심으로 처리해 콘솔 노이즈를 줄이기 위함
- Scope: `src/libs/query/{actionQueryError.ts,appointmentQueries.ts,groupQueries.ts,placeQueries.ts,invitationQueries.ts}`, `src/hooks/useRequestErrorPresenter.ts`, `src/hooks/useRequestErrorPresenter.test.ts`, `src/libs/query/actionQueryError.test.ts`

## 콘솔 디버그 라벨(action/query) 및 메타 보존 강화 (2026-03-05)
- Decision: `buildDebug`에서 입력 에러 타입을 `action/query/unknown`으로 분류해 `label`을 반환하고, `Error` 인스턴스(`ActionQueryError` 포함)에서도 `requestId/errorCode/debug/message/stack`을 함께 보존해 출력한다. `use-action-debug`는 콘솔 payload에 `label`을 기본 포함한다.
- Alternatives: 기존처럼 라벨 없이 단일 payload 출력, `Error` 인스턴스는 `name/message/stack`만 출력
- Reason: Action/Query 에러 흐름을 콘솔에서 즉시 구분하고, query 경로에서 누락되던 운영 추적 메타(`requestId/errorCode`)를 유지하기 위함
- Scope: `src/hooks/{build-debug.ts,use-action-debug.ts,useRequestErrorPresenter.ts}`, `src/hooks/{build-debug.test.ts,use-action-debug.test.ts,useRequestErrorPresenter.test.ts}`

## 요청 경고 모달 중복 표시 억제 (2026-03-05)
- Decision: `syncRequestError`에서 동일 에러(`message/errorCode/requestId`)는 상태가 해제될 때까지 1회만 표시하고, `RequestErrorProvider`에서도 동일 키의 경고를 짧은 쿨다운(1.2s) 동안 재오픈하지 않도록 전역 중복 방지를 추가한다.
- Alternatives: 기존처럼 렌더마다 `openRequestError` 호출 허용
- Reason: React Query 에러 상태가 유지되는 동안 동일 경고창이 반복 노출되어 UX가 과도하게 방해되는 문제를 줄이기 위함
- Scope: `src/hooks/useRequestErrorPresenter.ts`, `src/provider/request-error-provider.tsx`, `src/hooks/useRequestErrorPresenter.test.ts`
