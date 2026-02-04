'use client';

import { useState } from 'react';

import {
  container,
  title,
  dropdown,
  dropdownButton,
  dropdownMenu,
  dropdownItem,
  dropdownItemActive,
  buttonRow,
  nextButton,
  helperText,
} from './GroupStep.css';

import type { GroupSummary } from '@/actions/group';

type GroupStepProps = {
  groups: GroupSummary[];
  currentGroupId: string | null;
  currentGroupName: string;
  errorMessage: string;
  onSelectGroup: (groupId: string) => void;
  onNext: () => void;
};

export function GroupStep({
  groups,
  currentGroupId,
  currentGroupName,
  errorMessage,
  onSelectGroup,
  onNext,
}: GroupStepProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={container}>
      <div className={title}>어떤 그룹에 약속을 만들까요?</div>
      <div className={dropdown}>
        <button
          type="button"
          className={dropdownButton}
          onClick={() => setIsOpen((prev) => !prev)}>
          {currentGroupName}
          <span>▼</span>
        </button>
        {isOpen && (
          <div className={dropdownMenu}>
            {groups.map((group) => {
              const isActive = group.groupId === currentGroupId;
              return (
                <button
                  key={group.groupId}
                  type="button"
                  className={`${dropdownItem} ${
                    isActive ? dropdownItemActive : ''
                  }`}
                  onClick={() => {
                    onSelectGroup(group.groupId);
                    setIsOpen(false);
                  }}>
                  {group.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className={helperText}>{errorMessage}</div>
      <div className={buttonRow}>
        <button type="button" className={nextButton} onClick={onNext}>
          다음
        </button>
      </div>
    </div>
  );
}
