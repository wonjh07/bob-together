export const placeKeys = {
  all: ['places'] as const,
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
  reviewsRoot: () => [...placeKeys.all, 'reviews'] as const,
  reviews: (placeId: string) => [...placeKeys.reviewsRoot(), placeId] as const,
};
