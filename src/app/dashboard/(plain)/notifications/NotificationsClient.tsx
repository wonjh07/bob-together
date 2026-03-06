'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  markInvitationIndicatorSeenAction,
  respondToInvitationAction,
} from '@/actions/invitation';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import { useRequestError } from '@/hooks/useRequestError';
import { invalidateAfterInvitationResponse } from '@/libs/query/invalidateInvitationQueries';
import { invitationKeys } from '@/libs/query/invitationKeys';
import {
  createReceivedInvitationsQueryOptions,
  type InvitationPage,
} from '@/libs/query/invitationQueries';
import { useQueryScope } from '@/provider/query-scope-provider';

import NotificationInviteCard from './_components/NotificationInviteCard';
import * as styles from './page.css';

export default function NotificationsClient() {
  const queryClient = useQueryClient();
  const queryScope = useQueryScope();
  const queryOptions = createReceivedInvitationsQueryOptions(queryScope);
  const [processingInvitationId, setProcessingInvitationId] = useState<
    string | null
  >(null);
  const hasMarkedSeenRef = useRef(false);
  const { showRequestError } = useRequestError();

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
          showRequestError(result, {
            fallbackMessage: '초대 처리에 실패했습니다.',
          });
          return;
        }

        if (!result.data) {
          showRequestError('초대 처리에 실패했습니다.');
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
    [
      showRequestError,
      processingInvitationId,
      queryClient,
      updateInvitationStatusCache,
    ],
  );

  useEffect(() => {
    if (hasMarkedSeenRef.current || isLoading || isError || !data) {
      return;
    }

    hasMarkedSeenRef.current = true;

    void markInvitationIndicatorSeenAction()
      .then((result) => {
        if (!result.ok) {
          console.error('[invitation-read-state] 알림 읽음 상태 저장 실패', result);
          return;
        }

        queryClient.setQueryData<boolean>(
          invitationKeys.indicator(queryScope),
          false,
        );
      })
      .catch((error: unknown) => {
        console.error('[invitation-read-state] 알림 읽음 상태 저장 실패', error);
      });
  }, [data, isError, isLoading, queryClient, queryScope]);

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
          errorPresentation="modal"
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
      )}    </div>
  );
}
