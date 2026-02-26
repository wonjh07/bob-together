'use client';

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  type AppointmentListCursor,
  type PeriodFilter as PeriodFilterType,
  type TypeFilter as TypeFilterType,
} from '@/actions/appointment';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createAppointmentListQueryOptions,
  type AppointmentPage,
  type AppointmentQueryKey,
} from '@/libs/query/appointmentQueries';
import { useGroupContext } from '@/provider/group-provider';
import { useQueryScope } from '@/provider/query-scope-provider';

import { AppointmentCard } from './AppointmentCard';
import * as styles from './AppointmentList.css';
import { PeriodFilter } from './PeriodFilter';
import { TypeFilter } from './TypeFilter';

export function AppointmentList() {
  const router = useRouter();
  const { currentGroupId } = useGroupContext();
  const queryScope = useQueryScope();

  const [period, setPeriod] = useState<PeriodFilterType>('all');
  const [type, setType] = useState<TypeFilterType>('all');
  const queryOptions = createAppointmentListQueryOptions(
    currentGroupId,
    period,
    type,
    queryScope,
  );

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<
    AppointmentPage,
    Error,
    InfiniteData<AppointmentPage>,
    AppointmentQueryKey,
    AppointmentListCursor | null
  >({
    ...queryOptions,
    enabled: Boolean(currentGroupId),
  });

  const appointments = data?.pages.flatMap((page) => page.appointments) ?? [];
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });

  const handleOpenDetail = (appointmentId: string) => {
    router.push(`/dashboard/appointments/${appointmentId}`);
  };

  const handleRetry = () => {
    refetch();
  };

  if (!currentGroupId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 className={styles.emptyTitle}>그룹을 선택해주세요</h3>
          <p className={styles.emptyDescription}>
            상단에서 그룹을 선택하면 약속 목록을 볼 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filtersContainer}>
        <div className={styles.filterRow}>
          <TypeFilter value={type} onChange={setType} />
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner ariaLabel="약속 목록 로딩 중" />
        </div>
      ) : isError ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : '약속 목록을 가져올 수 없습니다.'}
          </p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className={styles.emptyTitle}>약속이 없습니다</h3>
          <p className={styles.emptyDescription}>
            새로운 약속을 만들어 그룹원들과 함께해보세요!
          </p>
        </div>
      ) : (
        <>
          <div className={styles.listContainer}>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.appointmentId}
                appointment={appointment}
                onDetail={handleOpenDetail}
              />
            ))}
          </div>

          {isFetchingNextPage && (
            <div className={styles.loadingContainer}>
              <LoadingSpinner ariaLabel="약속 목록 추가 로딩 중" />
            </div>
          )}

          {hasMore && !isFetchingNextPage && (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          )}
        </>
      )}
    </div>
  );
}
