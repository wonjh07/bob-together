'use client';

import { useState, useRef, useEffect } from 'react';

import {
  filterContainer,
  filterButton,
  filterButtonActive,
  dropdownMenu,
  dropdownItem,
  dropdownItemSelected,
  chevronIcon,
  chevronIconOpen,
} from './PeriodFilter.css';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    PERIOD_OPTIONS.find((opt) => opt.value === value)?.label || '전체';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: PeriodFilterType) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className={filterContainer} ref={containerRef}>
      <button
        type="button"
        className={`${filterButton} ${isOpen ? filterButtonActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedLabel}</span>
        <svg
          className={`${chevronIcon} ${isOpen ? chevronIconOpen : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={dropdownMenu}>
          {PERIOD_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`${dropdownItem} ${
                value === option.value ? dropdownItemSelected : ''
              }`}
              onClick={() => handleSelect(option.value)}>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
