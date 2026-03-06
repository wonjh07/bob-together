'use client';

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  type AppointmentListCursor,
  type PeriodFilter as PeriodFilterType,
  type TypeFilter as TypeFilterType,
} from '@/actions/appointment';
import GroupEmptyIcon from '@/components/icons/GroupEmptyIcon';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import { useSyncRequestError } from '@/hooks/useRequestError';
import {
  createAppointmentListQueryOptions,
  type AppointmentPage,
  type AppointmentQueryKey,
} from '@/libs/query/appointmentQueries';
import { useGroupContext } from '@/provider/group-provider';
import { useQueryScope } from '@/provider/query-scope-provider';

import * as styles from './AppointmentList.css';
import AppointmentListContent from './AppointmentListContent';
import * as contentStyles from './AppointmentListContent.css';
import { PeriodFilter } from './PeriodFilter';
import { TypeFilter } from './TypeFilter';

export function AppointmentList() {
  const { currentGroupId } = useGroupContext();
  const queryScope = useQueryScope();

  const [period, setPeriod] = useState<PeriodFilterType>('all');
  const [type, setType] = useState<TypeFilterType>('all');
  const queryOptions = useMemo(
    () =>
      createAppointmentListQueryOptions(
        currentGroupId,
        period,
        type,
        queryScope,
      ),
    [currentGroupId, period, queryScope, type],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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

  const appointments = useMemo(
    () => data?.pages.flatMap((page) => page.appointments) ?? [],
    [data],
  );
  const showEmptyState = appointments.length === 0 && !isError;
  const showList = appointments.length > 0;
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });
  useSyncRequestError({
    active: isError,
    error,
    fallbackMessage: '약속 목록을 가져올 수 없습니다.',
  });

  if (!currentGroupId) {
    return (
      <div className={styles.container}>
        <div className={contentStyles.emptyState}>
          <GroupEmptyIcon className={contentStyles.emptyIcon} />
          <h3 className={contentStyles.emptyTitle}>그룹을 선택해주세요</h3>
          <p className={contentStyles.emptyDescription}>
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
      <AppointmentListContent
        isLoading={isLoading}
        showEmptyState={showEmptyState}
        showList={showList}
        appointments={appointments}
        isFetchingNextPage={isFetchingNextPage}
        hasMore={hasMore}
        loadMoreRef={loadMoreRef}
      />
    </div>
  );
}
