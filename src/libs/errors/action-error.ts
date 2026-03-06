import type {
  FieldErrorMap,
  ServiceErrorCode,
} from '@/actions/_common/service-action';

interface RecordLike {
  [key: string]: unknown;
}

const SERVICE_ERROR_CODES = new Set<ServiceErrorCode>([
  'validation',
  'auth',
  'conflict',
  'not_found',
  'permission',
  'server',
]);

export interface UiErrorState {
  message?: string;
  errorType: ServiceErrorCode;
  fieldErrors?: FieldErrorMap;
}

const UI_ERROR_LOGGED_FLAG = Symbol.for('bob-together.ui-error-logged');

function isRecord(value: unknown): value is RecordLike {
  return typeof value === 'object' && value !== null;
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isFieldErrorMap(value: unknown): value is FieldErrorMap {
  if (!isRecord(value) || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((messages) => {
    if (!Array.isArray(messages)) {
      return false;
    }

    return messages.every((message) => typeof message === 'string');
  });
}

export function isServiceErrorType(
  value: string | undefined,
): value is ServiceErrorCode {
  return Boolean(value && SERVICE_ERROR_CODES.has(value as ServiceErrorCode));
}

function resolveErrorType(params: {
  explicit?: string;
  fieldErrors?: FieldErrorMap;
  nestedErrorType?: ServiceErrorCode;
}): ServiceErrorCode {
  if (isServiceErrorType(params.explicit)) {
    return params.explicit;
  }

  if (params.fieldErrors) {
    return 'validation';
  }

  return params.nestedErrorType ?? 'server';
}

export function readUiError(err: unknown): UiErrorState | null {
  if (typeof err === 'string') {
    const message = toNonEmptyString(err);
    return message
      ? {
          message,
          errorType: 'server',
        }
      : null;
  }

  if (err instanceof Error) {
    const message = toNonEmptyString(err.message);
    const record = err as Error & {
      errorType?: unknown;
      fieldErrors?: unknown;
      error?: unknown;
    };
    const explicitErrorType = toNonEmptyString(record.errorType);
    const fieldErrors = isFieldErrorMap(record.fieldErrors)
      ? record.fieldErrors
      : undefined;
    const nestedError = readUiError(record.error);
    const errorType = resolveErrorType({
      explicit: explicitErrorType,
      fieldErrors,
      nestedErrorType: nestedError?.errorType,
    });

    return {
      message: message ?? nestedError?.message,
      errorType,
      fieldErrors: fieldErrors ?? nestedError?.fieldErrors,
    };
  }

  if (!isRecord(err)) {
    return null;
  }

  const explicitErrorType = toNonEmptyString(err.errorType);
  const message = toNonEmptyString(err.message) ?? toNonEmptyString(err.error);
  const fieldErrors = isFieldErrorMap(err.fieldErrors)
    ? err.fieldErrors
    : undefined;
  const nestedError = 'error' in err ? readUiError(err.error) : null;

  if (!message && !explicitErrorType && !fieldErrors && !nestedError) {
    return null;
  }

  return {
    message: message ?? nestedError?.message,
    errorType: resolveErrorType({
      explicit: explicitErrorType,
      fieldErrors,
      nestedErrorType: nestedError?.errorType,
    }),
    fieldErrors: fieldErrors ?? nestedError?.fieldErrors,
  };
}

function unwrapUiLogError(err: unknown): unknown {
  if (!isRecord(err) || !('error' in err)) {
    return err;
  }

  if (err.error === undefined || err.error === null) {
    return err;
  }

  return unwrapUiLogError(err.error);
}

function wasUiErrorLogged(err: unknown) {
  if (typeof err !== 'object' || err === null) {
    return false;
  }

  const record = err as Record<PropertyKey, unknown>;
  return record[UI_ERROR_LOGGED_FLAG] === true;
}

function markUiErrorLogged(err: unknown) {
  if (typeof err !== 'object' || err === null) {
    return;
  }

  try {
    Object.defineProperty(err, UI_ERROR_LOGGED_FLAG, {
      value: true,
      configurable: true,
    });
  } catch {
    // ignore non-extensible objects
  }
}

export function logUiError(params: {
  err: unknown;
  fallbackMessage?: string;
}) {
  if (wasUiErrorLogged(params.err)) {
    return;
  }

  const resolved = readUiError(params.err);
  const header = resolved?.message ?? params.fallbackMessage;

  console.error(
    `[request-error] ${header}\n`,
    unwrapUiLogError(params.err),
  );

  markUiErrorLogged(params.err);
}
