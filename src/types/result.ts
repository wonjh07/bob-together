import type {
  FieldErrorMap,
  ServiceErrorCode,
} from '@/actions/_common/service-action';

// 공통 Action 응답 타입

export type ActionSuccess<T = void> = {
  ok: true;
  data?: T;
  success?: string;
};

export type ActionError<E extends ServiceErrorCode = ServiceErrorCode> = {
  ok: false;
  errorType: E;
  message: string;
  reason?: string;
  fieldErrors?: FieldErrorMap;
  error?: unknown;
};

export type ActionResult<T = void, E extends ServiceErrorCode = ServiceErrorCode> =
  | ActionSuccess<T>
  | ActionError<E>;

// 공통 에러 타입
export type CommonErrorType = ServiceErrorCode;

// 인증 관련 에러
export type AuthErrorType = ServiceErrorCode;

// 데이터 검증 에러
export type ValidationErrorType = ServiceErrorCode;

// 그룹 관련 에러
export type GroupErrorType = ServiceErrorCode;

// 장소 관련 에러
export type PlaceErrorType = ServiceErrorCode;

// 약속 관련 에러
export type AppointmentErrorType = ServiceErrorCode;
