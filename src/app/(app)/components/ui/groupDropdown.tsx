'use client';

import { useEffect, useRef } from 'react';

import {
  groupDropdown,
  groupButton,
  dropdownMenu,
  dropdownItem,
} from './groupDropdown.css';

interface GroupDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupSelect?: (groupId: string) => void;
  currentGroup?: string;
}

export function GroupDropdown({
  isOpen,
  onOpenChange,
  onGroupSelect,
  currentGroup = '그룹1',
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
        {currentGroup} <span>▼</span>
      </button>
      {isOpen && (
        <div ref={dropdownRef} className={dropdownMenu}>
          <a
            className={dropdownItem}
            href="#group1"
            onClick={(e) => {
              e.preventDefault();
              handleGroupClick('그룹1');
            }}>
            그룹1
          </a>
          <a
            className={dropdownItem}
            href="#group2"
            onClick={(e) => {
              e.preventDefault();
              handleGroupClick('그룹2');
            }}>
            그룹2
          </a>
          <a
            className={dropdownItem}
            href="#group3"
            onClick={(e) => {
              e.preventDefault();
              handleGroupClick('그룹3');
            }}>
            그룹3
          </a>
        </div>
      )}
    </div>
  );
}
