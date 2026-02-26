import { withQueryScope, type QueryScope } from './queryScope';

export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string, scope?: QueryScope) =>
    withQueryScope([...placeKeys.all, 'detail', placeId] as const, scope),
  reviewsRoot: () => [...placeKeys.all, 'reviews'] as const,
  reviews: (placeId: string, scope?: QueryScope) =>
    withQueryScope([...placeKeys.reviewsRoot(), placeId] as const, scope),
};
