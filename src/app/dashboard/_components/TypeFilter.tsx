'use client';

import ChipToggleGroup from '@/components/ui/ChipToggleGroup';

import type { TypeFilter as TypeFilterType } from '@/actions/appointment';

import * as chip from '@/styles/primitives/chip.css';

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
    <ChipToggleGroup
      options={TYPE_OPTIONS}
      value={value}
      onChange={onChange}
      containerClassName={chip.chipContainer}
      buttonClassName={chip.chipButton}
      activeButtonClassName={chip.chipButtonActive}
    />
  );
}
