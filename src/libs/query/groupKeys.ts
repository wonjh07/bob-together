import { withQueryScope, type QueryScope } from './queryScope';

export const groupKeys = {
  all: ['groups'] as const,
  myGroups: (scope?: QueryScope) =>
    withQueryScope([...groupKeys.all, 'my'] as const, scope),
  manage: (scope?: QueryScope) =>
    withQueryScope([...groupKeys.all, 'manage'] as const, scope),
  detail: (groupId: string, scope?: QueryScope) =>
    withQueryScope([...groupKeys.all, 'detail', groupId] as const, scope),
  searchRoot: () => [...groupKeys.all, 'search'] as const,
  search: (query: string, scope?: QueryScope) =>
    withQueryScope([...groupKeys.searchRoot(), query] as const, scope),
};
