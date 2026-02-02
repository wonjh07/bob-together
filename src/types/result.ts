// 공통 Action 응답 타입

export type ActionSuccess<T = void> = {
  ok: true;
  data?: T;
};

export type ActionError<E extends string = string> = {
  ok: false;
  error: E;
  message?: string;
};

export type ActionResult<T = void, E extends string = string> =
  | ActionSuccess<T>
  | ActionError<E>;

// 공통 에러 코드
export type CommonErrorCode =
  | 'missing-fields'
  | 'invalid-format'
  | 'server-error'
  | 'unauthorized'
  | 'forbidden';

// 인증 관련 에러
export type AuthErrorCode =
  | CommonErrorCode
  | 'invalid-email'
  | 'invalid-password'
  | 'invalid-credentials'
  | 'email-exists'
  | 'signup-failed'
  | 'login-failed'
  | 'logout-failed'
  | 'forbidden-origin'
  | 'user-not-found';

// 데이터 검증 에러
export type ValidationErrorCode =
  | CommonErrorCode
  | 'email-invalid'
  | 'password-too-short'
  | 'password-too-long'
  | 'passwords-mismatch'
  | 'name-required'
  | 'nickname-required'
  | 'check-failed';

// 그룹 관련 에러
export type GroupErrorCode =
  | CommonErrorCode
  | 'group-not-found'
  | 'group-name-taken'
  | 'group-name-duplicated'
  | 'already-member'
  | 'invite-already-sent';
