'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { leaveGroupAction } from '@/actions/group';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { groupKeys } from '@/libs/query/groupKeys';
import {
  createGroupManageQueryOptions,
  type GroupManagePage,
} from '@/libs/query/groupQueries';

import GroupManageCard from './_components/GroupManageCard';
import * as styles from './page.css';

export default function ProfileGroupsClient() {
  const queryClient = useQueryClient();
  const queryOptions = createGroupManageQueryOptions();
  const [openedMenuGroupId, setOpenedMenuGroupId] = useState<string | null>(
    null,
  );
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);

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

  const groups =
    data?.pages.flatMap((page: GroupManagePage) => page.groups) ?? [];
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

  const handleToggleMenu = (groupId: string) => {
    setOpenedMenuGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const handleCloseMenu = useCallback(() => {
    setOpenedMenuGroupId(null);
  }, []);

  const handleLeaveGroup = useCallback(
    async (groupId: string) => {
      if (!groupId || leavingGroupId) return;

      setLeavingGroupId(groupId);
      setOpenedMenuGroupId(null);

      try {
        const result = await leaveGroupAction(groupId);
        if (!result.ok) {
          toast.error(result.message || '그룹 탈퇴에 실패했습니다.');
          return;
        }

        queryClient.setQueryData<InfiniteData<GroupManagePage>>(
          queryOptions.queryKey,
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              pages: prev.pages.map((page) => ({
                ...page,
                groups: page.groups.filter(
                  (group) => group.groupId !== groupId,
                ),
              })),
            };
          },
        );

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: groupKeys.manage() }),
          queryClient.invalidateQueries({ queryKey: groupKeys.myGroups() }),
        ]);
        toast.success('그룹에서 탈퇴했습니다.');
      } finally {
        setLeavingGroupId(null);
      }
    },
    [leavingGroupId, queryClient, queryOptions.queryKey],
  );

  return (
    <div className={styles.page}>
      <PlainTopNav title="그룹 관리" />

      {isLoading ? (
        <div className={styles.statusBox}>그룹 정보를 불러오는 중...</div>
      ) : isError ? (
        <div className={styles.statusBox}>
          {error instanceof Error
            ? error.message
            : '그룹 정보를 불러오지 못했습니다.'}
        </div>
      ) : groups.length === 0 ? (
        <div className={styles.statusBox}>가입한 그룹이 없습니다.</div>
      ) : (
        <div className={styles.list}>
          {groups.map((group) => (
            <GroupManageCard
              key={group.groupId}
              group={group}
              isMenuOpen={openedMenuGroupId === group.groupId}
              isLeaving={leavingGroupId === group.groupId}
              onToggleMenu={handleToggleMenu}
              onCloseMenu={handleCloseMenu}
              onLeaveGroup={handleLeaveGroup}
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
