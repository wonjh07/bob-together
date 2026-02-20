'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { respondToInvitationAction } from '@/actions/invitation';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { appointmentKeys } from '@/libs/query/appointmentKeys';
import { groupKeys } from '@/libs/query/groupKeys';
import { invalidateReceivedInvitationsQueries } from '@/libs/query/invalidateInvitationQueries';
import {
  createReceivedInvitationsQueryOptions,
  type InvitationPage,
} from '@/libs/query/invitationQueries';

import NotificationInviteCard from './_components/NotificationInviteCard';
import * as styles from './page.css';

export default function NotificationsClient() {
  const queryClient = useQueryClient();
  const queryOptions = createReceivedInvitationsQueryOptions();
  const [processingInvitationId, setProcessingInvitationId] = useState<
    string | null
  >(null);

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

  const invitations =
    data?.pages.flatMap((page: InvitationPage) => page.invitations) ?? [];
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

  const updateInvitationStatusCache = useCallback(
    (invitationId: string, status: 'accepted' | 'rejected') => {
      queryClient.setQueryData<InfiniteData<InvitationPage>>(
        queryOptions.queryKey,
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              invitations: page.invitations.map((invitation) =>
                invitation.invitationId === invitationId
                  ? { ...invitation, status }
                  : invitation,
              ),
            })),
          };
        },
      );
    },
    [queryClient, queryOptions.queryKey],
  );

  const handleRespond = useCallback(
    async (invitationId: string, decision: 'accepted' | 'rejected') => {
      if (!invitationId || processingInvitationId) return;

      setProcessingInvitationId(invitationId);

      try {
        const result = await respondToInvitationAction({
          invitationId,
          decision,
        });

        if (!result.ok) {
          toast.error(result.message || '초대 처리에 실패했습니다.');
          return;
        }

        if (!result.data) {
          toast.error('초대 처리에 실패했습니다.');
          return;
        }

        updateInvitationStatusCache(invitationId, result.data.status);

        await Promise.all([
          invalidateReceivedInvitationsQueries(queryClient),
          queryClient.invalidateQueries({
            queryKey:
              result.data.type === 'group' ? groupKeys.all : appointmentKeys.all,
          }),
        ]);

        toast.success(
          decision === 'accepted'
            ? '초대를 수락했습니다.'
            : '초대를 거절했습니다.',
        );
      } finally {
        setProcessingInvitationId(null);
      }
    },
    [processingInvitationId, queryClient, updateInvitationStatusCache],
  );

  return (
    <div className={styles.page}>
      <PlainTopNav title="알림" rightHidden />

      {isLoading ? (
        <div className={styles.statusBox}>알림을 불러오는 중...</div>
      ) : isError ? (
        <div className={styles.statusBox}>
          {error instanceof Error
            ? error.message
            : '알림을 불러오지 못했습니다.'}
        </div>
      ) : invitations.length === 0 ? (
        <div className={styles.statusBox}>받은 초대가 없습니다.</div>
      ) : (
        <div className={styles.list}>
          {invitations.map((invitation) => (
            <NotificationInviteCard
              key={invitation.invitationId}
              invitation={invitation}
              isProcessing={processingInvitationId === invitation.invitationId}
              onAccept={(id) => handleRespond(id, 'accepted')}
              onReject={(id) => handleRespond(id, 'rejected')}
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
