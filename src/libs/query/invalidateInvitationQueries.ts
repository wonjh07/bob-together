import { invitationKeys } from './invitationKeys';

import type { QueryClient } from '@tanstack/react-query';

export async function invalidateReceivedInvitationsQueries(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({
    queryKey: invitationKeys.receivedRoot(),
  });
}
