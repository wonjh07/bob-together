'use client';

import { useEffect, useRef } from 'react';

import {
  groupDropdown,
  groupButton,
  dropdownMenu,
  dropdownItem,
  dropdownItemActive,
  dropdownEmpty,
  dropdownMeta,
} from './groupDropdown.css';

import type { GroupSummary } from '@/actions/group';

interface GroupDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupSelect?: (groupId: string) => void;
  groups?: GroupSummary[];
  currentGroupId?: string | null;
  currentGroupName?: string;
  isLoading?: boolean;
}

export function GroupDropdown({
  isOpen,
  onOpenChange,
  onGroupSelect,
  groups = [],
  currentGroupId,
  currentGroupName = '그룹 선택',
  isLoading = false,
}: GroupDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const groupButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        groupButtonRef.current &&
        !groupButtonRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onOpenChange]);

  const handleGroupClick = (groupId: string) => {
    onGroupSelect?.(groupId);
    onOpenChange(false);
  };

  return (
    <div className={groupDropdown}>
      <button
        ref={groupButtonRef}
        className={groupButton}
        onClick={() => onOpenChange(!isOpen)}>
        {currentGroupName} <span>▼</span>
      </button>
      {isOpen && (
        <div ref={dropdownRef} className={dropdownMenu}>
          {isLoading && <div className={dropdownEmpty}>불러오는 중...</div>}
          {!isLoading && groups.length === 0 && (
            <div className={dropdownEmpty}>가입한 그룹이 없습니다.</div>
          )}
          {!isLoading &&
            groups.map((group) => {
              const isActive = group.groupId === currentGroupId;
              return (
                <button
                  key={group.groupId}
                  type="button"
                  className={`${dropdownItem} ${
                    isActive ? dropdownItemActive : ''
                  }`}
                  onClick={() => handleGroupClick(group.groupId)}>
                  <span>{group.name}</span>
                  {isActive && <span className={dropdownMeta}>선택됨</span>}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
