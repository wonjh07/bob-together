'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

import {
  listAppointmentsAction,
  type PeriodFilter as PeriodFilterType,
  type TypeFilter as TypeFilterType,
  type AppointmentListItem,
} from '@/actions/appointment';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useGroupContext } from '@/provider/group-provider';

import { AppointmentCard } from './AppointmentCard';
import {
  container,
  filtersContainer,
  filterRow,
  listContainer,
  emptyState,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  loadingContainer,
  loadingSpinner,
  loadMoreTrigger,
  errorContainer,
  errorMessage,
  retryButton,
} from './AppointmentList.css';
import { PeriodFilter } from './PeriodFilter';
import { TypeFilter } from './TypeFilter';

const LIMIT = 10;

export function AppointmentList() {
  const router = useRouter();
  const { currentGroupId } = useGroupContext();

  const [period, setPeriod] = useState<PeriodFilterType>('all');
  const [type, setType] = useState<TypeFilterType>('all');
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (isInitial: boolean) => {
      if (!currentGroupId) {
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      if (isInitial) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await listAppointmentsAction({
          groupId: currentGroupId,
          period,
          type,
          cursor: isInitial ? undefined : (cursor ?? undefined),
          limit: LIMIT,
        });

        if (!result.ok || !result.data) {
          setError(
            result.ok
              ? '데이터가 없습니다.'
              : result.message || '약속 목록을 가져올 수 없습니다.',
          );
          return;
        }

        const { appointments: newAppointments, nextCursor } = result.data;

        if (isInitial) {
          setAppointments(newAppointments);
        } else {
          setAppointments((prev) => [...prev, ...newAppointments]);
        }

        setHasMore(nextCursor !== null);
        setCursor(nextCursor);
      } catch {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentGroupId, period, type, cursor],
  );

  // Initial fetch and reset on filter/group change
  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchAppointments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroupId, period, type]);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      await fetchAppointments(false);
    }
  }, [fetchAppointments, isLoadingMore, hasMore]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore,
  });

  const handleEdit = (appointmentId: string) => {
    router.push(`/dashboard/appointments/${appointmentId}/edit`);
  };

  const handleRetry = () => {
    setCursor(null);
    setHasMore(true);
    fetchAppointments(true);
  };

  if (!currentGroupId) {
    return (
      <div className={container}>
        <div className={emptyState}>
          <svg
            className={emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 className={emptyTitle}>그룹을 선택해주세요</h3>
          <p className={emptyDescription}>
            상단에서 그룹을 선택하면 약속 목록을 볼 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      <div className={filtersContainer}>
        <div className={filterRow}>
          <TypeFilter value={type} onChange={setType} />
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {isLoading ? (
        <div className={loadingContainer}>
          <div className={loadingSpinner} />
        </div>
      ) : error ? (
        <div className={errorContainer}>
          <p className={errorMessage}>{error}</p>
          <button type="button" className={retryButton} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className={emptyState}>
          <svg
            className={emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className={emptyTitle}>약속이 없습니다</h3>
          <p className={emptyDescription}>
            새로운 약속을 만들어 그룹원들과 함께해보세요!
          </p>
        </div>
      ) : (
        <>
          <div className={listContainer}>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.appointmentId}
                appointment={appointment}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {isLoadingMore && (
            <div className={loadingContainer}>
              <div className={loadingSpinner} />
            </div>
          )}

          {hasMore && !isLoadingMore && (
            <div ref={loadMoreRef} className={loadMoreTrigger} />
          )}
        </>
      )}
    </div>
  );
}
