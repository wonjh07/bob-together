'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  createAppointmentSearchQueryOptions,
  type AppointmentSearchPage,
} from '@/libs/query/appointmentQueries';
import { formatDateDot, formatTimeRange24 } from '@/utils/dateFormat';

import AppointmentSearchCard from './AppointmentSearchCard';
import * as styles from './AppointmentSearchResults.css';

interface AppointmentSearchResultsProps {
  query: string;
}

export default function AppointmentSearchResults({
  query,
}: AppointmentSearchResultsProps) {
  const normalizedQuery = query.trim();
  const queryOptions = createAppointmentSearchQueryOptions(normalizedQuery);

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
    enabled: normalizedQuery.length >= 2,
  });

  const appointments =
    data?.pages.flatMap((page: AppointmentSearchPage) => page.appointments) ?? [];
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

  if (normalizedQuery.length < 2) {
    return <div className={styles.status}>검색어를 2자 이상 입력해주세요.</div>;
  }

  if (isLoading) {
    return <div className={styles.status}>검색 중...</div>;
  }

  if (isError) {
    return (
      <div className={styles.status}>
        {error instanceof Error ? error.message : '약속 검색에 실패했습니다.'}
      </div>
    );
  }

  if (appointments.length === 0) {
    return <div className={styles.status}>검색 결과가 없습니다.</div>;
  }

  return (
    <div className={styles.list}>
      {appointments.map((appointment) => (
        <AppointmentSearchCard
          key={appointment.appointmentId}
          appointmentId={appointment.appointmentId}
          title={appointment.title}
          date={formatDateDot(appointment.startAt)}
          timeRange={formatTimeRange24(appointment.startAt, appointment.endsAt)}
          hostName={
            appointment.hostNickname || appointment.hostName || '알 수 없음'
          }
          hostProfileImage={appointment.hostProfileImage}
          memberCount={appointment.memberCount}
        />
      ))}
      {isFetchingNextPage && <div className={styles.status}>더 불러오는 중...</div>}
      {hasMore && !isFetchingNextPage && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      )}
    </div>
  );
}
