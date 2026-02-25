import { useEffect } from 'react';

import type { RefObject } from 'react';

type OutsideEventType = 'click' | 'mousedown' | 'pointerdown';

interface UseClickOutsideOptions {
  enabled?: boolean;
  eventType?: OutsideEventType;
}

type ElementRef = RefObject<HTMLElement | null>;

export function useClickOutside(
  refs: ElementRef | ElementRef[],
  onOutside: () => void,
  options: UseClickOutsideOptions = {},
) {
  const { enabled = true, eventType = 'pointerdown' } = options;

  useEffect(() => {
    if (!enabled) return;

    const refList = Array.isArray(refs) ? refs : [refs];

    const handleOutside = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const isInside = refList.some((ref) => {
        const element = ref.current;
        if (!element) return false;
        return element.contains(target);
      });

      if (isInside) return;
      onOutside();
    };

    document.addEventListener(eventType, handleOutside);
    return () => {
      document.removeEventListener(eventType, handleOutside);
    };
  }, [enabled, eventType, onOutside, refs]);
}

