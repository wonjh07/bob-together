import {
  getPlaceDetailAction,
  listPlaceReviewsAction,
  type PlaceReviewCursor,
  type PlaceReviewItem,
} from '@/actions/place';
import { runQueryAction } from '@/libs/errors/request-error';
import { placeKeys } from '@/libs/query/placeKeys';
import { type QueryScope } from '@/libs/query/queryScope';

import type { QueryFunctionContext } from '@tanstack/react-query';

const PLACE_REVIEW_LIST_LIMIT = 10;

type PlaceDetailQueryKey = ReturnType<typeof placeKeys.detail>;
type PlaceReviewsQueryKey = ReturnType<typeof placeKeys.reviews>;

export type PlaceReviewsPage = {
  reviews: PlaceReviewItem[];
  nextCursor: PlaceReviewCursor | null;
};

export function createPlaceDetailQueryOptions(
  placeId: string,
  scope?: QueryScope,
) {
  return {
    queryKey: placeKeys.detail(placeId, scope) as PlaceDetailQueryKey,
    queryFn: async (_: QueryFunctionContext<PlaceDetailQueryKey>) =>
      runQueryAction(() => getPlaceDetailAction(placeId), {
        fallbackMessage: '장소 정보를 불러오지 못했습니다.',
      }),
  };
}

export function createPlaceReviewsQueryOptions(
  placeId: string,
  scope?: QueryScope,
) {
  return {
    queryKey: placeKeys.reviews(placeId, scope) as PlaceReviewsQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<PlaceReviewsQueryKey, PlaceReviewCursor | null>) => {
      return runQueryAction(
        () => listPlaceReviewsAction({
          placeId,
          cursor: pageParam ?? undefined,
          limit: PLACE_REVIEW_LIST_LIMIT,
        }),
        {
        fallbackMessage: '장소 리뷰를 불러오지 못했습니다.',
        },
      );
    },
    initialPageParam: null as PlaceReviewCursor | null,
    getNextPageParam: (lastPage: PlaceReviewsPage) => lastPage.nextCursor ?? null,
  };
}
