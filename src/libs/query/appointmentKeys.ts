export const appointmentKeys = {
  all: ['appointments'] as const,
  listRoot: () => [...appointmentKeys.all, 'list'] as const,
  list: (groupId: string | null, period: string, type: string) =>
    [...appointmentKeys.listRoot(), groupId, period, type] as const,
  searchRoot: () => [...appointmentKeys.all, 'search'] as const,
  search: (query: string) => [...appointmentKeys.searchRoot(), query] as const,
  detail: (appointmentId: string) =>
    [...appointmentKeys.all, 'detail', appointmentId] as const,
  comments: (appointmentId: string) =>
    [...appointmentKeys.detail(appointmentId), 'comments'] as const,
};
