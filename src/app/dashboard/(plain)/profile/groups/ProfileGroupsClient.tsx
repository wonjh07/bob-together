'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';

import { leaveGroupAction } from '@/actions/group';
import SearchIcon from '@/components/icons/SearchIcon';
import ChipToggleGroup from '@/components/ui/ChipToggleGroup';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createGroupManageQueryOptions,
  type GroupManagePage,
} from '@/libs/query/groupQueries';
import { invalidateGroupMembershipQueries } from '@/libs/query/invalidateGroupQueries';

import GroupManageCard from './_components/GroupManageCard';
import * as styles from './page.css';

type GroupManageTab = 'owned' | 'joined';

const GROUP_TAB_OPTIONS: Array<{ value: GroupManageTab; label: string }> = [
  { value: 'owned', label: '내가 만든 그룹' },
  { value: 'joined', label: '가입한 그룹' },
];

export default function ProfileGroupsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryOptions = createGroupManageQueryOptions();
  const [activeTab, setActiveTab] = useState<GroupManageTab>('owned');
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
  const filteredGroups = groups.filter((group) =>
    activeTab === 'owned' ? group.isOwner : !group.isOwner,
  );
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
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

        await invalidateGroupMembershipQueries(queryClient);
        toast.success('그룹에서 탈퇴했습니다.');
      } finally {
        setLeavingGroupId(null);
      }
    },
    [leavingGroupId, queryClient, queryOptions.queryKey],
  );

  const emptyTextByTab =
    activeTab === 'owned' ? '내가 만든 그룹이 없습니다.' : '가입한 그룹이 없습니다.';
  const shouldShowFilteredEmpty =
    !isLoading && !isError && filteredGroups.length === 0 && !hasMore;

  return (
    <div className={styles.page}>
      <PlainTopNav title="그룹 관리" />
      <div className={styles.filterBox}>
        <ChipToggleGroup
          options={GROUP_TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
          containerClassName={styles.filterContainer}
          buttonClassName={styles.chipButton}
          activeButtonClassName={styles.chipButtonActive}
        />
        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.findButton}
            aria-label="그룹 찾기"
            title="그룹 찾기"
            onClick={() => router.push('/dashboard/profile/groups/find')}>
            <SearchIcon size={18} />
          </button>
          <button
            type="button"
            className={styles.createButton}
            aria-label="새 그룹"
            title="새 그룹"
            onClick={() => router.push('/dashboard/profile/groups/create')}>
            <AiOutlineUsergroupAdd aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      {isLoading || isError ? (
        <ListStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={false}
          error={error}
          loadingVariant="spinner"
          loadingText="그룹 정보를 불러오는 중..."
          emptyText={emptyTextByTab}
          defaultErrorText="그룹 정보를 불러오지 못했습니다."
          className={styles.statusBox}
        />
      ) : shouldShowFilteredEmpty ? (
        <ListStateView
          isLoading={false}
          isError={false}
          isEmpty={true}
          error={null}
          loadingText="그룹 정보를 불러오는 중..."
          emptyText={emptyTextByTab}
          defaultErrorText="그룹 정보를 불러오지 못했습니다."
          className={styles.statusBox}
        />
      ) : (
        <div className={styles.list}>
          {filteredGroups.map((group) => (
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
            <InlineLoading
              text="더 불러오는 중..."
              className={styles.statusInline}
            />
          ) : null}
          {hasMore && !isFetchingNextPage ? (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          ) : null}
        </div>
      )}
    </div>
  );
}
