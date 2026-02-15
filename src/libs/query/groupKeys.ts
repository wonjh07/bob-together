export const groupKeys = {
  all: ['groups'] as const,
  myGroups: () => [...groupKeys.all, 'my'] as const,
  manage: () => [...groupKeys.all, 'manage'] as const,
  detail: (groupId: string) => [...groupKeys.all, 'detail', groupId] as const,
  search: (query: string) => [...groupKeys.all, 'search', query] as const,
};
