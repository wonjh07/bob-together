'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  createGroupSearchQueryOptions,
  type GroupSearchPage,
} from '@/libs/query/groupQueries';

import GroupSearchCard from './GroupSearchCard';
import * as styles from './GroupSearchResults.css';

interface GroupSearchResultsProps {
  query: string;
}

export default function GroupSearchResults({ query }: GroupSearchResultsProps) {
  const normalizedQuery = query.trim();
  const queryOptions = createGroupSearchQueryOptions(normalizedQuery);

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

  const groups = data?.pages.flatMap((page: GroupSearchPage) => page.groups) ?? [];
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
        {error instanceof Error ? error.message : '그룹 검색에 실패했습니다.'}
      </div>
    );
  }

  if (groups.length === 0) {
    return <div className={styles.status}>검색 결과가 없습니다.</div>;
  }

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <GroupSearchCard key={group.groupId} {...group} />
      ))}
      {isFetchingNextPage && <div className={styles.status}>더 불러오는 중...</div>}
      {hasMore && !isFetchingNextPage && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      )}
    </div>
  );
}
