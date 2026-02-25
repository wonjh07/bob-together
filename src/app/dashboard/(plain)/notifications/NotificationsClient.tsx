'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { respondToInvitationAction } from '@/actions/invitation';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import { invalidateAfterInvitationResponse } from '@/libs/query/invalidateInvitationQueries';
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
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
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

        await invalidateAfterInvitationResponse(queryClient, {
          status: result.data.status,
          type: result.data.type,
        });

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

  const hasState = isLoading || isError || invitations.length === 0;

  return (
    <div className={styles.page}>
      <PlainTopNav title="알림" rightHidden />

      {hasState ? (
        <ListStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={invitations.length === 0}
          error={error}
          loadingVariant="spinner"
          loadingText="알림을 불러오는 중..."
          emptyText="받은 초대가 없습니다."
          defaultErrorText="알림을 불러오지 못했습니다."
          className={styles.statusBox}
        />
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
