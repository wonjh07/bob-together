'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  createAppointmentHistoryQueryOptions,
  type AppointmentHistoryPage,
} from '@/libs/query/appointmentQueries';

import HistoryAppointmentCard from './_components/HistoryAppointmentCard';
import * as styles from './page.css';

export default function ProfileHistoryClient() {
  const queryOptions = createAppointmentHistoryQueryOptions();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...queryOptions,
  });

  const appointments =
    data?.pages.flatMap((page: AppointmentHistoryPage) => page.appointments) ?? [];
  const hasMore = Boolean(hasNextPage);

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoading || isFetchingNextPage,
  });

  return (
    <div className={styles.page}>
      <PlainTopNav title="히스토리" rightHidden />

      {isLoading ? (
        <div className={styles.statusBox}>히스토리를 불러오는 중...</div>
      ) : isError ? (
        <div className={styles.statusBox}>
          {error instanceof Error
            ? error.message
            : '히스토리를 불러오지 못했습니다.'}
        </div>
      ) : appointments.length === 0 ? (
        <div className={styles.statusBox}>종료된 약속이 없습니다.</div>
      ) : (
        <div className={styles.list}>
          {appointments.map((appointment) => (
            <HistoryAppointmentCard
              key={appointment.appointmentId}
              appointment={appointment}
            />
          ))}
          {isFetchingNextPage ? (
            <div className={styles.statusInline}>더 불러오는 중...</div>
          ) : null}
          {hasMore && !isFetchingNextPage ? (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          ) : null}
        </div>
      )}
    </div>
  );
}
