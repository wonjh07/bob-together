'use client';

import { useEffect, useMemo, useRef } from 'react';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useSyncRequestError } from '@/hooks/useRequestError';
import { logUiError, readUiError } from '@/libs/errors/action-error';

import * as styles from './ListStateView.css';

interface ListStateViewProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: unknown;
  loadingText: string;
  emptyText: string;
  defaultErrorText: string;
  className?: string;
  loadingVariant?: 'text' | 'spinner';
  errorPresentation?: 'inline' | 'modal';
  errorTitle?: string;
}

export default function ListStateView({
  isLoading,
  isError,
  isEmpty,
  error,
  loadingText,
  emptyText,
  defaultErrorText,
  className,
  loadingVariant = 'text',
  errorPresentation = 'inline',
  errorTitle,
}: ListStateViewProps) {
  const lastInlineLoggedErrorKeyRef = useRef<string | null>(null);
  useSyncRequestError({
    active: errorPresentation === 'modal' && isError,
    error,
    fallbackMessage: defaultErrorText,
    message: errorPresentation === 'modal' && isError
      ? readUiError(error)?.message ?? defaultErrorText
      : undefined,
    title: errorTitle ?? '요청 처리 실패',
  });

  const resolvedError = useMemo(() => readUiError(error), [error]);
  const errorMessage = resolvedError?.message ?? defaultErrorText;

  useEffect(() => {
    if (errorPresentation === 'modal') {
      return;
    }

    if (!isError) {
      lastInlineLoggedErrorKeyRef.current = null;
      return;
    }

    const logKey = [errorMessage, resolvedError?.errorType ?? ''].join('|');
    if (lastInlineLoggedErrorKeyRef.current === logKey) {
      return;
    }

    lastInlineLoggedErrorKeyRef.current = logKey;
    logUiError({
      err: error,
      fallbackMessage: errorMessage,
    });
  }, [error, errorMessage, errorPresentation, isError, resolvedError?.errorType]);

  if (isLoading) {
    if (loadingVariant === 'spinner') {
      return (
        <div className={className}>
          <div className={styles.loadingWrap}>
            <LoadingSpinner tone="main" ariaLabel={loadingText} />
            <p className={styles.loadingText}>{loadingText}</p>
          </div>
        </div>
      );
    }

    return <div className={className}>{loadingText}</div>;
  }

  if (isError) {
    if (errorPresentation === 'modal') {
      return null;
    }

    return (
      <div className={className}>{errorMessage}</div>
    );
  }

  if (isEmpty) {
    return <div className={className}>{emptyText}</div>;
  }

  return null;
}
