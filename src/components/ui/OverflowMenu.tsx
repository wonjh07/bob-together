'use client';

import Link from 'next/link';
import { BsThreeDotsVertical } from 'react-icons/bs';

import DropdownMenu from '@/components/ui/DropdownMenu';

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
  return (
    <DropdownMenu
      isOpen={isOpen}
      onOpenChange={(open) => (open ? onToggle() : onClose())}
      containerClassName={styles.wrap}
      menuClassName={styles.dropdown}
      outsideEventType="pointerdown"
      renderTrigger={({ toggle }) => (
        <button
          type="button"
          className={styles.trigger}
          onClick={toggle}
          aria-label={ariaLabel}
          disabled={isDisabled}>
          <BsThreeDotsVertical className={styles.triggerIcon} aria-hidden="true" />
        </button>
      )}>
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
    </DropdownMenu>
  );
}
