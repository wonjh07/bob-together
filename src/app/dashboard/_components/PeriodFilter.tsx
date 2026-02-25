'use client';

import { useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';

import * as styles from './PeriodFilter.css';

import type { PeriodFilter as PeriodFilterType } from '@/actions/appointment';

interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (value: PeriodFilterType) => void;
}

const PERIOD_OPTIONS: { value: PeriodFilterType; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'week', label: '1주일' },
  { value: 'month', label: '1개월' },
  { value: 'all', label: '전체' },
];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel =
    PERIOD_OPTIONS.find((opt) => opt.value === value)?.label || '전체';

  const handleSelect = (newValue: PeriodFilterType) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <DropdownMenu
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      containerClassName={styles.filterContainer}
      menuClassName={styles.dropdownMenu}
      outsideEventType="mousedown"
      renderTrigger={({ isOpen: triggerOpen, toggle }) => (
        <button
          type="button"
          className={`${styles.filterButton} ${
            triggerOpen ? styles.filterButtonActive : ''
          }`}
          onClick={toggle}>
          <span>{selectedLabel}</span>
          <svg
            className={`${styles.chevronIcon} ${
              triggerOpen ? styles.chevronIconOpen : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}>
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.dropdownItem} ${
            value === option.value ? styles.dropdownItemSelected : ''
          }`}
          onClick={() => handleSelect(option.value)}>
          {option.label}
        </button>
      ))}
    </DropdownMenu>
  );
}
