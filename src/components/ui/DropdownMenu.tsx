'use client';

import { useRef } from 'react';

import { useClickOutside } from '@/hooks/useClickOutside';

import type { ReactNode } from 'react';

interface DropdownMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  containerClassName?: string;
  menuClassName?: string;
  outsideEventType?: 'click' | 'mousedown' | 'pointerdown';
  renderTrigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
}

export default function DropdownMenu({
  isOpen,
  onOpenChange,
  containerClassName,
  menuClassName,
  outsideEventType = 'pointerdown',
  renderTrigger,
  children,
}: DropdownMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => onOpenChange(false), {
    enabled: isOpen,
    eventType: outsideEventType,
  });

  return (
    <div ref={containerRef} className={containerClassName}>
      {renderTrigger({
        isOpen,
        toggle: () => onOpenChange(!isOpen),
      })}
      {isOpen ? <div className={menuClassName}>{children}</div> : null}
    </div>
  );
}

