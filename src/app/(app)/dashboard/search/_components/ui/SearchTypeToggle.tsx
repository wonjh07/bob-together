'use client';

import CalendarIcon from '@/components/icons/CalendarIcon';
import GroupIcon from '@/components/icons/GroupIcon';

import * as styles from './SearchTypeToggle.css';

interface SearchTypeToggleProps {
  value: 'group' | 'appointment';
  onChange: (value: 'group' | 'appointment') => void;
}

export function SearchTypeToggle({ value, onChange }: SearchTypeToggleProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.title}>검색</div>
      <div className={styles.pill}>
        <span
          aria-hidden="true"
          className={`${styles.indicator} ${
            value === 'appointment' ? styles.indicatorRight : ''
          }`}
        />
        <button
          type="button"
          className={`${styles.segment} ${
            value === 'group' ? styles.active : ''
          }`}
          onClick={() => onChange('group')}>
          <GroupIcon width="16" height="16" />
          그룹
        </button>
        <button
          type="button"
          className={`${styles.segment} ${
            value === 'appointment' ? styles.active : ''
          }`}
          onClick={() => onChange('appointment')}>
          <CalendarIcon width="16" height="16" />
          약속
        </button>
      </div>
    </div>
  );
}
