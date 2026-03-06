import type {
  FieldErrorMap,
  ServiceErrorCode,
} from '@/actions/_common/service-action';
import type { ActionError, ActionResult } from '@/types/result';

export class RequestError extends Error {
  readonly errorType: ServiceErrorCode;
  readonly reason?: string;
  readonly fieldErrors?: FieldErrorMap;
  readonly error?: unknown;

  constructor(actionError: ActionError<ServiceErrorCode>) {
    super(actionError.message);
    this.name = 'RequestError';
    this.errorType = actionError.errorType;
    this.reason = actionError.reason;
    this.fieldErrors = actionError.fieldErrors;

    if (actionError.error !== undefined) {
      this.error = actionError.error;
    }
  }
}

interface UnwrapActionResultOptions {
  fallbackMessage: string;
  emptyDataMessage?: string;
}

function isNonNullData<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function unwrapActionResult<T>(
  result: ActionResult<T, ServiceErrorCode>,
  options: UnwrapActionResultOptions,
): T {
  if (result.ok) {
    if (isNonNullData(result.data)) {
      return result.data;
    }

    throw new RequestError({
      ok: false,
      errorType: 'server',
      message: options.emptyDataMessage ?? '데이터가 없습니다.',
    });
  }

  throw new RequestError({
    ...result,
    message: result.message || options.fallbackMessage,
  });
}

interface RunQueryActionOptions<T, TSelected = T> extends UnwrapActionResultOptions {
  select?: (data: T) => TSelected;
}

export async function runQueryAction<T, TSelected = T>(
  run: () => Promise<ActionResult<T, ServiceErrorCode>>,
  options: RunQueryActionOptions<T, TSelected>,
): Promise<TSelected> {
  const data = unwrapActionResult(await run(), options);

  if (options.select) {
    return options.select(data);
  }

  return data as unknown as TSelected;
}
