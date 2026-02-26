import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import { getServerQueryScope } from '@/libs/query/getServerQueryScope';
import {
  createPlaceDetailQueryOptions,
  createPlaceReviewsQueryOptions,
} from '@/libs/query/placeQueries';

import PlaceDetailClient from './PlaceDetailClient';

type PlaceDetailPageProps = {
  params: {
    placeId: string;
  };
};

export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const placeId = params.placeId;
  const queryClient = new QueryClient();
  const queryScope = await getServerQueryScope();

  await Promise.allSettled([
    queryClient.prefetchQuery(createPlaceDetailQueryOptions(placeId, queryScope)),
    queryClient.prefetchInfiniteQuery(
      createPlaceReviewsQueryOptions(placeId, queryScope),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlaceDetailClient placeId={placeId} />
    </HydrationBoundary>
  );
}
