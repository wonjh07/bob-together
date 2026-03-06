'use client';

import { useCallback, useEffect, useRef } from 'react';

import { logUiError, readUiError } from '@/libs/errors/action-error';
import { useRequestErrorContext } from '@/provider/request-error-provider';

import type { ServiceErrorCode } from '@/actions/_common/service-action';

interface UseRequestErrorOptions {
  fallbackMessage?: string;
  title?: string;
  closeLabel?: string;
}

interface ShowRequestErrorOptions {
  fallbackMessage?: string;
  title?: string;
  closeLabel?: string;
  errorType?: ServiceErrorCode;
}

interface UseSyncRequestErrorOptions extends UseRequestErrorOptions {
  active: boolean;
  error: unknown;
  message?: string;
}

function createOwnerId() {
  return `request-error-owner-${Math.random().toString(36).slice(2, 10)}`;
}

export function useRequestError({
  fallbackMessage = '요청 처리에 실패했습니다.',
  title,
  closeLabel,
}: UseRequestErrorOptions = {}) {
  const requestErrorContext = useRequestErrorContext();
  const ownerIdRef = useRef<string>(createOwnerId());

  if (!requestErrorContext) {
    throw new Error('RequestErrorProvider is required.');
  }

  const showRequestError = useCallback(
    (input: unknown, options?: ShowRequestErrorOptions) => {
      const parsed = typeof input === 'string' ? null : readUiError(input);
      const stringMessage =
        typeof input === 'string' ? input.trim() : undefined;
      const resolvedMessage =
        stringMessage
        || parsed?.message
        || options?.fallbackMessage
        || fallbackMessage;

      if (!resolvedMessage) {
        return;
      }

      if (typeof input !== 'string' && input !== undefined) {
        logUiError({
          err: input,
          fallbackMessage: resolvedMessage,
        });
      }

      requestErrorContext.openRequestError(resolvedMessage, {
        title: options?.title ?? title,
        closeLabel: options?.closeLabel ?? closeLabel,
        errorType: options?.errorType ?? parsed?.errorType ?? 'server',
        ownerId: ownerIdRef.current,
      });
    },
    [closeLabel, fallbackMessage, requestErrorContext, title],
  );

  const hideRequestError = useCallback(() => {
    requestErrorContext.closeOwnedRequestError(ownerIdRef.current);
  }, [requestErrorContext]);

  return {
    showRequestError,
    hideRequestError,
  };
}

export function useSyncRequestError({
  active,
  error,
  message,
  fallbackMessage = '요청 처리에 실패했습니다.',
  title,
  closeLabel,
}: UseSyncRequestErrorOptions) {
  const { showRequestError, hideRequestError } = useRequestError({
    fallbackMessage,
    title,
    closeLabel,
  });
  const lastSyncedErrorKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) {
      lastSyncedErrorKeyRef.current = null;
      hideRequestError();
      return;
    }

    const parsed = readUiError(error);
    const resolvedMessage = message ?? parsed?.message ?? fallbackMessage;
    const dedupKey = [
      resolvedMessage,
      parsed?.errorType ?? '',
    ].join('|');

    if (lastSyncedErrorKeyRef.current === dedupKey) {
      return;
    }

    lastSyncedErrorKeyRef.current = dedupKey;
    showRequestError(error, { fallbackMessage: resolvedMessage });
  }, [active, error, fallbackMessage, hideRequestError, message, showRequestError]);
}
