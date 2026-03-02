import {
  hasPendingInvitationsAction,
  listReceivedInvitationsAction,
} from '@/actions/invitation';
import { invitationKeys } from '@/libs/query/invitationKeys';
import { type QueryScope } from '@/libs/query/queryScope';

import type { InvitationCursor, InvitationListItem } from '@/actions/invitation';
import type { QueryFunctionContext } from '@tanstack/react-query';

const INVITATION_LIST_LIMIT = 10;

type InvitationQueryKey = ReturnType<typeof invitationKeys.received>;
type PendingInvitationQueryKey = ReturnType<typeof invitationKeys.pending>;

export type InvitationPage = {
  invitations: InvitationListItem[];
  nextCursor: InvitationCursor | null;
};

export function createHasPendingInvitationsQueryOptions(scope?: QueryScope) {
  return {
    queryKey: invitationKeys.pending(scope) as PendingInvitationQueryKey,
    queryFn: async (_: QueryFunctionContext<PendingInvitationQueryKey>) => {
      const result = await hasPendingInvitationsAction();

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '알림 상태를 확인하지 못했습니다.',
        );
      }

      return result.data.hasPendingInvitations;
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  };
}

export function createReceivedInvitationsQueryOptions(scope?: QueryScope) {
  return {
    queryKey: invitationKeys.received(scope) as InvitationQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<InvitationQueryKey, InvitationCursor | null>) => {
      const result = await listReceivedInvitationsAction({
        cursor: pageParam ?? undefined,
        limit: INVITATION_LIST_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '알림 목록을 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as InvitationCursor | null,
    getNextPageParam: (lastPage: InvitationPage) => lastPage.nextCursor ?? null,
  };
}
