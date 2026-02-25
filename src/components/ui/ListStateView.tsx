import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
}: ListStateViewProps) {
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
    return (
      <div className={className}>
        {error instanceof Error ? error.message : defaultErrorText}
      </div>
    );
  }

  if (isEmpty) {
    return <div className={className}>{emptyText}</div>;
  }

  return null;
}
