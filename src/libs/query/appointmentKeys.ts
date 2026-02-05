export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (groupId: string | null, period: string, type: string) =>
    [...appointmentKeys.all, groupId, period, type] as const,
};
