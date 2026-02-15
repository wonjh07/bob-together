'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { joinGroupAction } from '@/actions/group';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { groupKeys } from '@/libs/query/groupKeys';
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
  const queryClient = useQueryClient();
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

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

  const handleJoinGroup = useCallback(
    async (groupId: string) => {
      if (!groupId || joiningGroupId) return;

      setJoiningGroupId(groupId);
      try {
        const result = await joinGroupAction(groupId);
        if (!result.ok) {
          toast.error(result.message || '그룹 가입에 실패했습니다.');
          return;
        }

        queryClient.setQueryData<InfiniteData<GroupSearchPage>>(
          queryOptions.queryKey,
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              pages: prev.pages.map((page) => ({
                ...page,
                groups: page.groups.map((group) => {
                  if (group.groupId !== groupId || group.isMember) return group;
                  return {
                    ...group,
                    isMember: true,
                    memberCount: group.memberCount + 1,
                  };
                }),
              })),
            };
          },
        );

        await queryClient.invalidateQueries({ queryKey: groupKeys.myGroups() });
        await queryClient.invalidateQueries({
          queryKey: groupKeys.search(normalizedQuery),
        });
        toast.success('그룹에 가입했습니다.');
      } finally {
        setJoiningGroupId(null);
      }
    },
    [joiningGroupId, normalizedQuery, queryClient, queryOptions.queryKey],
  );

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
        <GroupSearchCard
          key={group.groupId}
          {...group}
          isJoining={joiningGroupId === group.groupId}
          onJoin={handleJoinGroup}
        />
      ))}
      {isFetchingNextPage && <div className={styles.status}>더 불러오는 중...</div>}
      {hasMore && !isFetchingNextPage && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      )}
    </div>
  );
}
