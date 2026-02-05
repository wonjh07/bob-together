import { getMyGroupsAction } from '@/actions/group';
import { groupKeys } from '@/libs/query/groupKeys';

import type { QueryFunctionContext } from '@tanstack/react-query';

type MyGroupsQueryKey = ReturnType<typeof groupKeys.myGroups>;

export function createMyGroupsQueryOptions() {
  return {
    queryKey: groupKeys.myGroups(),
    queryFn: async (_: QueryFunctionContext<MyGroupsQueryKey>) => {
      const result = await getMyGroupsAction();

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '그룹 목록을 가져올 수 없습니다.',
        );
      }

      return result.data.groups;
    },
  };
}
