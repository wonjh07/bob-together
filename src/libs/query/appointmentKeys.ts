import { withQueryScope, type QueryScope } from './queryScope';

export const appointmentKeys = {
  all: ['appointments'] as const,
  listRoot: () => [...appointmentKeys.all, 'list'] as const,
  list: (
    groupId: string | null,
    period: string,
    type: string,
    scope?: QueryScope,
  ) =>
    withQueryScope(
      [...appointmentKeys.listRoot(), groupId, period, type] as const,
      scope,
    ),
  historyRoot: () => [...appointmentKeys.all, 'history'] as const,
  history: (scope?: QueryScope) =>
    withQueryScope([...appointmentKeys.historyRoot()] as const, scope),
  myCommentsRoot: () => [...appointmentKeys.all, 'my-comments'] as const,
  myComments: (scope?: QueryScope) =>
    withQueryScope([...appointmentKeys.myCommentsRoot()] as const, scope),
  myReviewsRoot: () => [...appointmentKeys.all, 'my-reviews'] as const,
  myReviews: (scope?: QueryScope) =>
    withQueryScope([...appointmentKeys.myReviewsRoot()] as const, scope),
  reviewableRoot: () => [...appointmentKeys.all, 'reviewable'] as const,
  reviewable: (scope?: QueryScope) =>
    withQueryScope([...appointmentKeys.reviewableRoot()] as const, scope),
  reviewTarget: (appointmentId: string, scope?: QueryScope) =>
    withQueryScope(
      [...appointmentKeys.all, 'review-target', appointmentId] as const,
      scope,
    ),
  searchRoot: () => [...appointmentKeys.all, 'search'] as const,
  search: (query: string, scope?: QueryScope) =>
    withQueryScope([...appointmentKeys.searchRoot(), query] as const, scope),
  detail: (appointmentId: string, scope?: QueryScope) =>
    withQueryScope(
      [...appointmentKeys.all, 'detail', appointmentId] as const,
      scope,
    ),
  invitationState: (appointmentId: string, scope?: QueryScope) =>
    withQueryScope(
      [...appointmentKeys.detail(appointmentId), 'invitation-state'] as const,
      scope,
    ),
  comments: (appointmentId: string, scope?: QueryScope) =>
    withQueryScope(
      [...appointmentKeys.detail(appointmentId), 'comments'] as const,
      scope,
    ),
};
