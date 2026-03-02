'use client';

import { useEffect, type RefObject } from 'react';

interface UseHorizontalInfiniteObserverOptions {
  rootRef: RefObject<HTMLElement | null>;
  targetRef: RefObject<HTMLElement | null>;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  threshold?: number;
  rootMargin?: string;
  observeKey?: unknown;
}

export function useHorizontalInfiniteObserver({
  rootRef,
  targetRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0.1,
  rootMargin = '0px 160px 0px 0px',
  observeKey,
}: UseHorizontalInfiniteObserverOptions) {
  useEffect(() => {
    const root = rootRef.current;
    const target = targetRef.current;
    if (!root || !target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        void fetchNextPage();
      },
      {
        root,
        threshold,
        rootMargin,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    rootMargin,
    rootRef,
    targetRef,
    threshold,
    observeKey,
  ]);
}
