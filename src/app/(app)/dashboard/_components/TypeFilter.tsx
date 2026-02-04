'use client';

import {
  filterContainer,
  chipButton,
  chipButtonActive,
} from './TypeFilter.css';

import type { TypeFilter as TypeFilterType } from '@/actions/appointment';

interface TypeFilterProps {
  value: TypeFilterType;
  onChange: (value: TypeFilterType) => void;
}

const TYPE_OPTIONS: { value: TypeFilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'created', label: '내가 만든' },
  { value: 'joined', label: '참가한' },
];

export function TypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <div className={filterContainer}>
      {TYPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${chipButton} ${
            value === option.value ? chipButtonActive : ''
          }`}
          onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
