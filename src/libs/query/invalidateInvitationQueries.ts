import { appointmentKeys } from './appointmentKeys';
import { groupKeys } from './groupKeys';
import { invitationKeys } from './invitationKeys';

import type { QueryClient } from '@tanstack/react-query';

export async function invalidateReceivedInvitationsQueries(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({
    queryKey: invitationKeys.receivedRoot(),
  });
}

export async function invalidateAfterInvitationResponse(
  queryClient: QueryClient,
  params: {
    status: 'accepted' | 'rejected';
    type: 'group' | 'appointment';
  },
) {
  const invalidations: Promise<unknown>[] = [
    invalidateReceivedInvitationsQueries(queryClient),
  ];

  if (params.status === 'accepted') {
    if (params.type === 'group') {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: groupKeys.all }),
        queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
      );
    } else {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
      );
    }
  }

  await Promise.all(invalidations);
}
