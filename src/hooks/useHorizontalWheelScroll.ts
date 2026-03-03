'use client';

import { useEffect, type RefObject } from 'react';

interface UseHorizontalWheelScrollOptions {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  observeKey?: unknown;
}

export function useHorizontalWheelScroll({
  containerRef,
  enabled = true,
  observeKey,
}: UseHorizontalWheelScrollOptions) {
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (container.scrollWidth <= container.clientWidth) return;

      // Keep native behavior for horizontal gesture.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      event.preventDefault();
      container.scrollLeft += event.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, enabled, observeKey]);
}
