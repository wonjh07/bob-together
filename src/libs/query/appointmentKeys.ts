export const appointmentKeys = {
  all: ['appointments'] as const,
  listRoot: () => [...appointmentKeys.all, 'list'] as const,
  list: (groupId: string | null, period: string, type: string) =>
    [...appointmentKeys.listRoot(), groupId, period, type] as const,
  historyRoot: () => [...appointmentKeys.all, 'history'] as const,
  history: () => [...appointmentKeys.historyRoot()] as const,
  myCommentsRoot: () => [...appointmentKeys.all, 'my-comments'] as const,
  myComments: () => [...appointmentKeys.myCommentsRoot()] as const,
  myReviewsRoot: () => [...appointmentKeys.all, 'my-reviews'] as const,
  myReviews: () => [...appointmentKeys.myReviewsRoot()] as const,
  reviewTarget: (appointmentId: string) =>
    [...appointmentKeys.all, 'review-target', appointmentId] as const,
  searchRoot: () => [...appointmentKeys.all, 'search'] as const,
  search: (query: string) => [...appointmentKeys.searchRoot(), query] as const,
  detail: (appointmentId: string) =>
    [...appointmentKeys.all, 'detail', appointmentId] as const,
  invitationState: (appointmentId: string) =>
    [...appointmentKeys.detail(appointmentId), 'invitation-state'] as const,
  comments: (appointmentId: string) =>
    [...appointmentKeys.detail(appointmentId), 'comments'] as const,
};
