'use client';

import { useCallback, useRef, useState } from 'react';

import type { MouseEvent, PointerEvent } from 'react';

const DRAG_THRESHOLD = 6;

export function useHorizontalDragScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const isCapturedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const endDrag = useCallback(() => {
    const container = containerRef.current;
    const pointerId = pointerIdRef.current;
    if (container && pointerId !== null && isCapturedRef.current) {
      container.releasePointerCapture(pointerId);
    }
    isCapturedRef.current = false;
    pointerIdRef.current = null;
    setIsDragging(false);
  }, []);

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('a,button,input,textarea,select,label')) return;

    const container = containerRef.current;
    if (!container) return;

    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    startScrollLeftRef.current = container.scrollLeft;
    movedRef.current = false;
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const container = containerRef.current;
    if (!container) return;

    const deltaX = event.clientX - startXRef.current;
    if (!movedRef.current) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD) {
        return;
      }

      movedRef.current = true;
      setIsDragging(true);
      container.setPointerCapture(event.pointerId);
      isCapturedRef.current = true;
    }

    container.scrollLeft = startScrollLeftRef.current - deltaX;
  }, []);

  const onPointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    endDrag();
  }, [endDrag]);

  const onPointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) return;
      endDrag();
    },
    [endDrag],
  );

  const onDragStart = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const consumeShouldPreventClick = useCallback(() => {
    if (!movedRef.current) return false;
    movedRef.current = false;
    return true;
  }, []);

  return {
    containerRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onDragStart,
    consumeShouldPreventClick,
  };
}
