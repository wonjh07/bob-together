import type { ActionError, ActionResult, ActionSuccess } from '@/types/result';
import type { ZodError } from 'zod';

export type ServiceErrorCode =
  | 'validation'
  | 'auth'
  | 'conflict'
  | 'not_found'
  | 'permission'
  | 'server';

export type FieldErrorMap = Record<string, string[]>;

export type ServiceActionSuccessState<TData = never> = {
  ok: true;
  requestId: string;
  data?: TData;
  success?: string;
};

export type ServiceActionErrorState<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
> = {
  ok: false;
  requestId: string;
  errorType: ServiceErrorCode;
  message: string;
  reason?: string;
  fieldErrors?: TFieldErrors;
  error?: unknown;
};

export type ServiceActionState<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
> =
  | ServiceActionSuccessState<TData>
  | ServiceActionErrorState<TFieldErrors>;

type RequestlessServiceActionSuccessState<TData = never> = Omit<
  ServiceActionSuccessState<TData>,
  'requestId'
>;

type RequestlessServiceActionErrorState<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
> = Omit<ServiceActionErrorState<TFieldErrors>, 'requestId'>;

type RequestlessServiceActionState<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
> =
  | RequestlessServiceActionSuccessState<TData>
  | RequestlessServiceActionErrorState<TFieldErrors>;

// request_id 생성 함수
export function createActionRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeFieldErrors(value: unknown): FieldErrorMap | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const normalized: FieldErrorMap = {};

  for (const [key, messages] of Object.entries(value)) {
    if (!Array.isArray(messages)) {
      continue;
    }

    const validMessages = messages.filter(
      (message): message is string => typeof message === 'string',
    );

    if (validMessages.length > 0) {
      normalized[key] = validMessages;
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeErrorValue(
  value: unknown,
  seen: WeakSet<object> = new WeakSet(),
): unknown {
  if (value === undefined || value === null) {
    return value;
  }

  if (
    typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
  ) {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'function' || typeof value === 'symbol') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeErrorValue(item, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);

    const whitelistKeys = new Set([
      'name',
      'message',
      'code',
      'status',
      'details',
      'hint',
      'digest',
      'rpcErrorCode',
      'issues',
      'fieldErrors',
      'cause',
    ]);

    const entries: Array<[string, unknown]> = [];
    const source = value instanceof Error
      ? ({
          name: value.name,
          message: value.message,
          ...Object.fromEntries(Object.entries(value)),
        } as Record<string, unknown>)
      : (value as Record<string, unknown>);

    for (const [key, entry] of Object.entries(source)) {
      if (!whitelistKeys.has(key)) {
        continue;
      }

      const normalizedEntry = normalizeErrorValue(entry, seen);
      if (normalizedEntry !== undefined) {
        entries.push([key, normalizedEntry]);
      }
    }

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return String(value);
}

// Supabase 에러
export function createActionErrorState<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
>(params: {
  requestId: string;
  code: ServiceErrorCode;
  message: string;
  reason?: string;
  fieldErrors?: TFieldErrors;
  error?: unknown;
  errorDetails?: unknown;
}): ServiceActionState<TFieldErrors, TData> {
  const {
    requestId,
    code,
    message,
    reason,
    fieldErrors,
    errorDetails,
    error,
  } = params;
  const resolvedFieldErrors =
    fieldErrors ??
    (normalizeFieldErrors(errorDetails) as TFieldErrors | undefined);
  const resolvedError = normalizeErrorValue(error);

  const state: ServiceActionErrorState<TFieldErrors> = {
    ok: false,
    requestId,
    errorType: code,
    message,
    fieldErrors: resolvedFieldErrors,
  };

  if (reason) {
    state.reason = reason;
  }

  if (resolvedError !== undefined) {
    state.error = resolvedError;
  }

  return state;
}


export function createZodValidationErrorState<TData = never>(params: {
  requestId: string;
  error: ZodError;
  fallbackMessage: string;
}): ServiceActionState<FieldErrorMap | undefined, TData> {
  const fieldErrors = normalizeFieldErrors(params.error.flatten().fieldErrors);

  return createActionErrorState<FieldErrorMap | undefined, TData>({
    requestId: params.requestId,
    code: 'validation',
    message: params.error.issues[0]?.message || params.fallbackMessage,
    fieldErrors,
    error: { issues: params.error.issues },
  });
}

interface PostgrestLikeError {
  code: string | null;
  message: string;
  details?: string | null;
  hint?: string | null;
}

interface DbErrorParams {
  action?: string;
  requestId: string;
  error: PostgrestLikeError;
  serverMessage: string;
  permission?: {
    codes: readonly string[];
    message: string;
  };
  extra?: Record<string, unknown>;
}


function toErrorMetadata(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { error };
  }

  const record = error as Record<string, unknown>;

  return {
    name: typeof record.name === 'string' ? record.name : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
    details: typeof record.details === 'string' ? record.details : undefined,
    hint: typeof record.hint === 'string' ? record.hint : undefined,
    stack: typeof record.stack === 'string' ? record.stack : undefined,
    error,
  };
}


function logServerActionError(params: {
  action?: string;
  requestId: string;
  errorType: ServiceErrorCode;
  error: unknown;
  extra?: Record<string, unknown>;
}) {
  console.error('[action-error]', {
    action: params.action ?? 'unknown',
    requestId: params.requestId,
    errorType: params.errorType,
    ...toErrorMetadata(params.error),
    extra: params.extra,
  });
}


export function dbError<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
>(params: DbErrorParams): ServiceActionState<TFieldErrors, TData> {
  const rawErrorCode = params.error.code ?? undefined;
  const isPermissionError = Boolean(
    rawErrorCode &&
      params.permission?.codes.includes(rawErrorCode),
  );

  logServerActionError({
    action: params.action,
    requestId: params.requestId,
    errorType: isPermissionError ? 'permission' : 'server',
    error: params.error,
    extra: params.extra,
  });

  if (isPermissionError) {
    return createActionErrorState<TFieldErrors, TData>({
      requestId: params.requestId,
      code: 'permission',
      message: params.permission?.message ?? '권한이 없습니다.',
      error: params.error,
    });
  }

  return createActionErrorState<TFieldErrors, TData>({
    requestId: params.requestId,
    code: 'server',
    message: params.serverMessage,
    error: params.error,
  });
}


export function createPostgrestErrorState<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
>(params: {
  action?: string;
  requestId: string;
  error: PostgrestLikeError;
  serverMessage: string;
  permissionCodes?: readonly string[];
  permissionMessage?: string;
  permissionExtra?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}): ServiceActionState<TFieldErrors, TData> {
  return dbError<TFieldErrors, TData>({
    action: params.action,
    requestId: params.requestId,
    error: params.error,
    serverMessage: params.serverMessage,
    permission: params.permissionCodes
      ? {
          codes: params.permissionCodes,
          message: params.permissionMessage ?? '권한이 없습니다.',
        }
      : undefined,
    extra: {
      ...params.extra,
      ...params.permissionExtra,
    },
  });
}


// 요청 성공 응답
export function createActionSuccessState<TData = never>(params: {
  requestId?: string;
  message?: string;
  data?: TData;
}): ServiceActionState<undefined, TData> {
  const state: ServiceActionSuccessState<TData> = {
    ok: true,
    requestId: params.requestId ?? createActionRequestId(),
  };

  if (params.message) {
    state.success = params.message;
  }
  if (params.data !== undefined) {
    state.data = params.data;
  }

  return state;
}


// 그외 예상치 못한 서버 에러
export function createServerErrorState<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
>(params: {
  requestId: string;
  message?: string;
  error?: unknown;
  action?: string;
}): ServiceActionState<TFieldErrors, TData> {
  if (params.error !== undefined) {
    logServerActionError({
      action: params.action,
      requestId: params.requestId,
      errorType: 'server',
      error: params.error,
    });
  }

  return createActionErrorState<TFieldErrors, TData>({
    requestId: params.requestId,
    code: 'server',
    message:
      params.message ??
      '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    error: params.error,
  });
}

type ServiceActionRunnerParams<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
> = {
  action?: string;
  requestId?: string;
  serverErrorMessage?: string;
  run: (context: {
    requestId: string;
  }) => Promise<
    | ServiceActionState<TFieldErrors, TData>
    | RequestlessServiceActionState<TFieldErrors, TData>
  >;
};

// `runServiceAction`
// service action 실행을 위임받아 대신 실행
// run 이 반환한 상태를 request_id 와 함께 그대로 반환
// # 목적 
// - request_id와 함께 에러를 분류하기 위함.
// - DB 와 redirect 에러를 try,catch 로 처리하기

export async function runServiceAction<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
>(params: ServiceActionRunnerParams<TFieldErrors, TData>): Promise<
  ServiceActionState<TFieldErrors, TData>
> {
  const requestId = params.requestId ?? createActionRequestId();
  const action = params.action ?? 'runServiceAction.unknown';

  try {
    const state = await params.run({ requestId });
    if ('requestId' in state && typeof state.requestId === 'string') {
      return state;
    }

    if (state.ok) {
      return {
        ok: true,
        requestId,
        data: state.data,
        success: state.success,
      };
    }

    return {
      ok: false,
      requestId,
      errorType: state.errorType,
      message: state.message,
      reason: state.reason,
      fieldErrors: state.fieldErrors,
      error: state.error,
    };
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    return createServerErrorState<TFieldErrors, TData>({
      requestId,
      message: params.serverErrorMessage,
      error,
      action,
    });
  }
}


function isNextRedirectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as { digest?: unknown };
  const digest = candidate.digest;

  if (typeof digest !== 'string') {
    return false;
  }

  return digest.startsWith('NEXT_REDIRECT');
}

export { createActionErrorState as errorState };

export function toActionResult<
  TFieldErrors extends FieldErrorMap | undefined = FieldErrorMap | undefined,
  TData = never,
>(
  state: ServiceActionState<TFieldErrors, TData>,
): ActionResult<TData> {
  if (state.ok) {
    const result: ActionSuccess<TData> = { ok: true };

    if (state.data !== undefined) {
      result.data = state.data;
    }

    if (state.success) {
      result.success = state.success;
    }

    return result;
  }

  const errorResult: ActionError<ServiceErrorCode> = {
    ok: false,
    errorType: state.errorType,
    message: state.message,
  };

  if (state.reason) {
    errorResult.reason = state.reason;
  }

  if (state.fieldErrors) {
    errorResult.fieldErrors = state.fieldErrors;
  }

  if (state.error !== undefined) {
    errorResult.error = state.error;
  }

  return errorResult;
}