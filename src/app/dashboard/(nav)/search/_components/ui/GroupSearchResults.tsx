'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { joinGroupAction } from '@/actions/group';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createGroupSearchQueryOptions,
  type GroupSearchPage,
} from '@/libs/query/groupQueries';
import { invalidateGroupMembershipQueries } from '@/libs/query/invalidateGroupQueries';

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

        await invalidateGroupMembershipQueries(queryClient);
        toast.success('그룹에 가입했습니다.');
      } finally {
        setJoiningGroupId(null);
      }
    },
    [joiningGroupId, queryClient, queryOptions.queryKey],
  );

  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });

  if (normalizedQuery.length < 2) {
    return <div className={styles.status}>검색어를 2자 이상 입력해주세요.</div>;
  }

  const hasState = isLoading || isError || groups.length === 0;
  if (hasState) {
    return (
      <ListStateView
        isLoading={isLoading}
        isError={isError}
        isEmpty={groups.length === 0}
        error={error}
        loadingVariant="spinner"
        loadingText="검색 중..."
        emptyText="검색 결과가 없습니다."
        defaultErrorText="그룹 검색에 실패했습니다."
        className={styles.status}
      />
    );
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
      {isFetchingNextPage ? (
        <InlineLoading text="더 불러오는 중..." className={styles.status} />
      ) : null}
      {hasMore && !isFetchingNextPage && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      )}
    </div>
  );
}
