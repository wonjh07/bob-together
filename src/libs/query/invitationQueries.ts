import { listReceivedInvitationsAction } from '@/actions/invitation';
import { invitationKeys } from '@/libs/query/invitationKeys';
import { type QueryScope } from '@/libs/query/queryScope';

import type { InvitationCursor, InvitationListItem } from '@/actions/invitation';
import type { QueryFunctionContext } from '@tanstack/react-query';

const INVITATION_LIST_LIMIT = 10;

type InvitationQueryKey = ReturnType<typeof invitationKeys.received>;

export type InvitationPage = {
  invitations: InvitationListItem[];
  nextCursor: InvitationCursor | null;
};

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
