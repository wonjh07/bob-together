import { groupKeys } from './groupKeys';

import type { QueryClient } from '@tanstack/react-query';

export async function invalidateGroupMembershipQueries(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: groupKeys.myGroups() }),
    queryClient.invalidateQueries({ queryKey: groupKeys.manage() }),
    queryClient.invalidateQueries({ queryKey: groupKeys.searchRoot() }),
  ]);
}
