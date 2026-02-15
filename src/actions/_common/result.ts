import type { ActionError, ActionSuccess } from '@/types/result';

export function actionSuccess<T>(data?: T): ActionSuccess<T> {
  if (data === undefined) {
    return { ok: true };
  }
  return { ok: true, data };
}

export function actionError<E extends string>(
  error: E,
  message?: string,
): ActionError<E> {
  return { ok: false, error, message };
}
