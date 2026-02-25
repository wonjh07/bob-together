import {
  getPlaceDetailAction,
  listPlaceReviewsAction,
  type PlaceReviewCursor,
  type PlaceReviewItem,
} from '@/actions/place';
import { placeKeys } from '@/libs/query/placeKeys';

import type { QueryFunctionContext } from '@tanstack/react-query';

const PLACE_REVIEW_LIST_LIMIT = 10;

type PlaceDetailQueryKey = ReturnType<typeof placeKeys.detail>;
type PlaceReviewsQueryKey = ReturnType<typeof placeKeys.reviews>;

export type PlaceReviewsPage = {
  reviews: PlaceReviewItem[];
  nextCursor: PlaceReviewCursor | null;
};

export function createPlaceDetailQueryOptions(placeId: string) {
  return {
    queryKey: placeKeys.detail(placeId) as PlaceDetailQueryKey,
    queryFn: async (_: QueryFunctionContext<PlaceDetailQueryKey>) => {
      const result = await getPlaceDetailAction(placeId);

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '장소 정보를 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
  };
}

export function createPlaceReviewsQueryOptions(placeId: string) {
  return {
    queryKey: placeKeys.reviews(placeId) as PlaceReviewsQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<PlaceReviewsQueryKey, PlaceReviewCursor | null>) => {
      const result = await listPlaceReviewsAction({
        placeId,
        cursor: pageParam ?? undefined,
        limit: PLACE_REVIEW_LIST_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '장소 리뷰를 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as PlaceReviewCursor | null,
    getNextPageParam: (lastPage: PlaceReviewsPage) => lastPage.nextCursor ?? null,
  };
}
