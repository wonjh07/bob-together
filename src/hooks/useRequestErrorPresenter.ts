'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  useRequestErrorModal,
  type RequestErrorOpenOptions,
} from '@/hooks/useRequestErrorModal';

interface UseRequestErrorPresenterOptions {
  source?: string;
  fallbackMessage?: string;
  title?: string;
  closeLabel?: string;
}

interface SyncRequestErrorParams {
  isError: boolean;
  err: unknown;
  message?: string;
}

function getDefaultMessage(err: unknown, fallbackMessage: string) {
  if (typeof err === 'string' && err.trim()) return err;
  if (err instanceof Error && err.message) return err.message;
  return fallbackMessage;
}

export function useRequestErrorPresenter({
  source = 'request_error',
  fallbackMessage = '요청 처리에 실패했습니다.',
  title,
  closeLabel,
}: UseRequestErrorPresenterOptions = {}) {
  const {
    openRequestError: openRequestErrorBase,
    closeRequestError: closeRequestErrorBase,
  } = useRequestErrorModal();
  const openedByThisHookRef = useRef(false);

  const clearOwnedRequestError = useCallback(() => {
    if (!openedByThisHookRef.current) return;
    closeRequestErrorBase();
    openedByThisHookRef.current = false;
  }, [closeRequestErrorBase]);

  const closeRequestError = useCallback(() => {
    closeRequestErrorBase();
    openedByThisHookRef.current = false;
  }, [closeRequestErrorBase]);

  const presentRequestError = useCallback(
    (message: string, options?: RequestErrorOpenOptions) => {
      if (!message) return;

      openRequestErrorBase(message, {
        err: options?.err,
        source: options?.source ?? source,
        title: options?.title ?? title,
        closeLabel: options?.closeLabel ?? closeLabel,
      });
      openedByThisHookRef.current = true;
    },
    [closeLabel, openRequestErrorBase, source, title],
  );

  const openOwnedRequestError = useCallback(
    (message: string, err: unknown) => {
      presentRequestError(message, { err });
    },
    [presentRequestError],
  );

  const syncRequestError = useCallback(
    ({ isError, err, message }: SyncRequestErrorParams) => {
      if (!isError) {
        clearOwnedRequestError();
        return;
      }

      presentRequestError(message ?? getDefaultMessage(err, fallbackMessage), {
        err,
      });
    },
    [clearOwnedRequestError, fallbackMessage, presentRequestError],
  );

  useEffect(() => {
    return () => {
      if (!openedByThisHookRef.current) return;
      closeRequestErrorBase();
    };
  }, [closeRequestErrorBase]);

  return {
    openRequestError: presentRequestError,
    closeRequestError,
    presentRequestError,
    syncRequestError,
    clearOwnedRequestError,
    openOwnedRequestError,
  };
}
