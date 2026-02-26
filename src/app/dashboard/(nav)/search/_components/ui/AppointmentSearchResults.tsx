'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createAppointmentSearchQueryOptions,
  type AppointmentSearchPage,
} from '@/libs/query/appointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';
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
  const queryScope = useQueryScope();
  const queryOptions = createAppointmentSearchQueryOptions(
    normalizedQuery,
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
  } = useInfiniteQuery({
    ...queryOptions,
    enabled: normalizedQuery.length >= 2,
  });

  const appointments =
    data?.pages.flatMap((page: AppointmentSearchPage) => page.appointments) ?? [];
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });

  if (normalizedQuery.length < 2) {
    return <div className={styles.status}>검색어를 2자 이상 입력해주세요.</div>;
  }

  const hasState = isLoading || isError || appointments.length === 0;
  if (hasState) {
    return (
      <ListStateView
        isLoading={isLoading}
        isError={isError}
        isEmpty={appointments.length === 0}
        error={error}
        loadingVariant="spinner"
        loadingText="검색 중..."
        emptyText="검색 결과가 없습니다."
        defaultErrorText="약속 검색에 실패했습니다."
        className={styles.status}
      />
    );
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
      {isFetchingNextPage ? (
        <InlineLoading text="더 불러오는 중..." className={styles.status} />
      ) : null}
      {hasMore && !isFetchingNextPage && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      )}
    </div>
  );
}
