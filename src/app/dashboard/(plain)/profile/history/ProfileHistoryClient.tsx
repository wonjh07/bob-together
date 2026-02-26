'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createAppointmentHistoryQueryOptions,
  type AppointmentHistoryPage,
} from '@/libs/query/appointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';

import HistoryAppointmentCard from './_components/HistoryAppointmentCard';
import * as styles from './page.css';

export default function ProfileHistoryClient() {
  const queryScope = useQueryScope();
  const queryOptions = createAppointmentHistoryQueryOptions(queryScope);

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
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });
  const hasState = isLoading || isError || appointments.length === 0;

  return (
    <div className={styles.page}>
      <PlainTopNav title="히스토리" rightHidden />

      {hasState ? (
        <ListStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={appointments.length === 0}
          error={error}
          loadingVariant="spinner"
          loadingText="히스토리를 불러오는 중..."
          emptyText="종료된 약속이 없습니다."
          defaultErrorText="히스토리를 불러오지 못했습니다."
          className={styles.statusBox}
        />
      ) : (
        <div className={styles.list}>
          {appointments.map((appointment) => (
            <HistoryAppointmentCard
              key={appointment.appointmentId}
              appointment={appointment}
            />
          ))}
          {isFetchingNextPage ? (
            <InlineLoading text="더 불러오는 중..." className={styles.statusInline} />
          ) : null}
          {hasMore && !isFetchingNextPage ? (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          ) : null}
        </div>
      )}
    </div>
  );
}
