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

import AppointmentSearchCard from './AppointmentSearchCard';
import * as styles from './AppointmentSearchResults.css';

interface AppointmentSearchResultsProps {
  query: string;
}

type SearchStateVariant = 'loading' | 'error' | 'empty';

interface SearchStateProps {
  variant: SearchStateVariant;
  error: unknown;
}

function SearchState({ variant, error }: SearchStateProps) {
  return (
    <ListStateView
      isLoading={variant === 'loading'}
      isError={variant === 'error'}
      isEmpty={variant === 'empty'}
      error={error}
      errorPresentation="modal"
      loadingVariant="spinner"
      loadingText="검색 중..."
      emptyText="검색 결과가 없습니다."
      defaultErrorText="약속 검색에 실패했습니다."
      className={styles.stateBox}
    />
  );
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
    return (
      <div className={styles.statusMessage}>검색어를 2자 이상 입력해주세요.</div>
    );
  }

  if (isLoading) {
    return <SearchState variant="loading" error={null} />;
  }

  if (isError) {
    return <SearchState variant="error" error={error} />;
  }

  if (appointments.length === 0) {
    return <SearchState variant="empty" error={null} />;
  }

  return (
    <div className={styles.list}>
      {appointments.map((appointment) => (
        <AppointmentSearchCard
          key={appointment.appointmentId}
          appointmentId={appointment.appointmentId}
          title={appointment.title}
          startAt={appointment.startAt}
          endsAt={appointment.endsAt}
          hostName={
            appointment.hostNickname || appointment.hostName || '알 수 없음'
          }
          hostProfileImage={appointment.hostProfileImage}
          memberCount={appointment.memberCount}
        />
      ))}
      {isFetchingNextPage ? (
        <InlineLoading text="더 불러오는 중..." className={styles.statusInline} />
      ) : null}
      {hasMore && !isFetchingNextPage && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      )}
    </div>
  );
}
