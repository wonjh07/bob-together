'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  createAppointmentHistoryQueryOptions,
  type AppointmentHistoryPage,
} from '@/libs/query/appointmentQueries';

import * as styles from './page.css';
import HistoryAppointmentCard from '../../history/_components/HistoryAppointmentCard';

export default function ProfileReviewWaitListClient() {
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
    data?.pages
      .flatMap((page: AppointmentHistoryPage) => page.appointments)
      .filter((appointment) => appointment.canWriteReview) ?? [];

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

  useEffect(() => {
    if (isLoading || isFetchingNextPage) return;
    if (appointments.length > 0) return;
    if (!hasNextPage) return;
    void fetchNextPage();
  }, [appointments.length, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  const isEmpty = !isLoading && !isFetchingNextPage && appointments.length === 0 && !hasNextPage;

  return (
    <div className={styles.page}>
      <PlainTopNav title="작성 가능한 리뷰" rightHidden />

      {isLoading ? (
        <div className={styles.statusBox}>작성 가능한 리뷰를 불러오는 중...</div>
      ) : isError ? (
        <div className={styles.statusBox}>
          {error instanceof Error
            ? error.message
            : '작성 가능한 리뷰를 불러오지 못했습니다.'}
        </div>
      ) : isEmpty ? (
        <div className={styles.statusBox}>작성 가능한 리뷰가 없습니다.</div>
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
