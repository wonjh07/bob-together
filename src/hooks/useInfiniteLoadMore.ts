import { useCallback } from 'react';

import { useInfiniteScroll } from './useInfiniteScroll';

interface UseInfiniteLoadMoreParams {
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

export function useInfiniteLoadMore({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: UseInfiniteLoadMoreParams) {
  const hasMore = Boolean(hasNextPage);

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoading || isFetchingNextPage,
  });

  return {
    hasMore,
    loadMoreRef,
  };
}

