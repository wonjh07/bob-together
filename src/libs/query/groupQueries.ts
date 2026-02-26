import {
  getMyGroupsAction,
  listMyGroupsWithStatsAction,
  searchGroupsWithCountAction,
  type GroupManageCursor,
  type GroupManageItem,
  type GroupSearchCursor,
  type GroupSearchItem,
} from '@/actions/group';
import { groupKeys } from '@/libs/query/groupKeys';
import { type QueryScope } from '@/libs/query/queryScope';

import type { QueryFunctionContext } from '@tanstack/react-query';

type MyGroupsQueryKey = ReturnType<typeof groupKeys.myGroups>;
type GroupManageQueryKey = ReturnType<typeof groupKeys.manage>;
type GroupSearchQueryKey = ReturnType<typeof groupKeys.search>;

const GROUP_SEARCH_LIMIT = 10;
const GROUP_MANAGE_LIMIT = 10;

export type GroupSearchPage = {
  groups: GroupSearchItem[];
  nextCursor: GroupSearchCursor | null;
};

export type GroupManagePage = {
  groups: GroupManageItem[];
  nextCursor: GroupManageCursor | null;
};

export function createMyGroupsQueryOptions(scope?: QueryScope) {
  return {
    queryKey: groupKeys.myGroups(scope),
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

export function createGroupManageQueryOptions(scope?: QueryScope) {
  return {
    queryKey: groupKeys.manage(scope) as GroupManageQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<GroupManageQueryKey, GroupManageCursor | null>) => {
      const result = await listMyGroupsWithStatsAction({
        cursor: pageParam ?? undefined,
        limit: GROUP_MANAGE_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '그룹 목록을 가져올 수 없습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as GroupManageCursor | null,
    getNextPageParam: (lastPage: GroupManagePage) => lastPage.nextCursor ?? null,
  };
}

export function createGroupSearchQueryOptions(
  query: string,
  scope?: QueryScope,
) {
  return {
    queryKey: groupKeys.search(query, scope) as GroupSearchQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<GroupSearchQueryKey, GroupSearchCursor | null>) => {
      if (!query) {
        return { groups: [], nextCursor: null };
      }

      const result = await searchGroupsWithCountAction({
        query,
        cursor: pageParam ?? undefined,
        limit: GROUP_SEARCH_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '그룹 검색에 실패했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as GroupSearchCursor | null,
    getNextPageParam: (lastPage: GroupSearchPage) => lastPage.nextCursor ?? null,
  };
}
