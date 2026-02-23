'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import * as styles from './OverflowMenu.css';

interface OverflowMenuItem {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface OverflowMenuProps {
  isOpen: boolean;
  isDisabled?: boolean;
  ariaLabel?: string;
  items: OverflowMenuItem[];
  onToggle: () => void;
  onClose: () => void;
}

export default function OverflowMenu({
  isOpen,
  isDisabled = false,
  ariaLabel = '메뉴',
  items,
  onToggle,
  onClose,
}: OverflowMenuProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={onToggle}
        aria-label={ariaLabel}
        disabled={isDisabled}>
        ⋮
      </button>

      {isOpen ? (
        <div className={styles.dropdown}>
          {items.map((item) => {
            if (item.href && !item.disabled) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={styles.linkItem}
                  onClick={onClose}>
                  {item.label}
                </Link>
              );
            }

            if (item.onClick && !item.disabled) {
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`${styles.buttonItem} ${
                    item.danger ? styles.dangerItem : ''
                  }`}
                  onClick={() => {
                    item.onClick?.();
                    onClose();
                  }}
                  disabled={isDisabled}>
                  {item.label}
                </button>
              );
            }

            return (
              <span key={item.key} className={styles.disabledItem}>
                {item.label}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
