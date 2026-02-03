'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const setLoadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) {
        loadMoreRef.current = null;
        return;
      }

      loadMoreRef.current = node;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry?.isIntersecting && hasMore && !isLoading) {
            onLoadMore();
          }
        },
        {
          threshold,
          rootMargin,
        },
      );

      observerRef.current.observe(node);
    },
    [hasMore, isLoading, onLoadMore, threshold, rootMargin],
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { loadMoreRef: setLoadMoreRef };
}

interface UseInfiniteQueryOptions<T, C> {
  queryFn: (cursor: C | undefined) => Promise<{
    data: T[];
    nextCursor: C | null;
  }>;
  getNextCursor: (lastItem: T) => C;
  enabled?: boolean;
}

export function useInfiniteQuery<T, C>({
  queryFn,
  enabled = true,
}: UseInfiniteQueryOptions<T, C>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<C | null>(null);

  const fetchInitial = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    cursorRef.current = null;

    try {
      const result = await queryFn(undefined);
      setData(result.data);
      setHasMore(result.nextCursor !== null);
      cursorRef.current = result.nextCursor;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled]);

  const fetchMore = useCallback(async () => {
    if (!enabled || !hasMore || isLoading || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const result = await queryFn(cursorRef.current ?? undefined);
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.nextCursor !== null);
      cursorRef.current = result.nextCursor;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [queryFn, enabled, hasMore, isLoading, isLoadingMore]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    setError(null);
    cursorRef.current = null;
  }, []);

  const refetch = useCallback(() => {
    reset();
    fetchInitial();
  }, [reset, fetchInitial]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchMore,
    refetch,
    reset,
  };
}
