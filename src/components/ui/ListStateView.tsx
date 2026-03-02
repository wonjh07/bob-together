'use client';

import { useEffect, useMemo, useState } from 'react';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RequestErrorModal from '@/components/ui/RequestErrorModal';

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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const errorMessage = useMemo(
    () => (error instanceof Error ? error.message : defaultErrorText),
    [defaultErrorText, error],
  );

  useEffect(() => {
    if (errorPresentation !== 'modal') return;
    if (isError) {
      setIsErrorModalOpen(true);
      return;
    }
    setIsErrorModalOpen(false);
  }, [errorMessage, errorPresentation, isError]);

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
      return (
        <RequestErrorModal
          isOpen={isErrorModalOpen}
          title={errorTitle ?? '요청 처리 실패'}
          message={errorMessage}
          onClose={() => setIsErrorModalOpen(false)}
        />
      );
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
