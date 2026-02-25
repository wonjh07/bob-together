'use client';

import DropdownMenu from '@/components/ui/DropdownMenu';

import * as styles from './GroupsDropdown.css';

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
  const handleGroupClick = (groupId: string) => {
    onGroupSelect?.(groupId);
    onOpenChange(false);
  };

  return (
    <DropdownMenu
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      containerClassName={styles.groupDropdown}
      menuClassName={styles.dropdownMenu}
      outsideEventType="click"
      renderTrigger={({ isOpen: triggerOpen, toggle }) => (
        <button
          type="button"
          className={`${styles.groupButton} ${
            triggerOpen ? styles.groupButtonActive : ''
          }`}
          onClick={toggle}>
          <span>{currentGroupName}</span>
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
      {isLoading && <div className={styles.dropdownEmpty}>불러오는 중...</div>}
      {!isLoading && groups.length === 0 && (
        <div className={styles.dropdownEmpty}>가입한 그룹이 없습니다.</div>
      )}
      {!isLoading &&
        groups.map((group) => {
          const isActive = group.groupId === currentGroupId;
          return (
            <button
              key={group.groupId}
              type="button"
              className={`${styles.dropdownItem} ${
                isActive ? styles.dropdownItemActive : ''
              }`}
              onClick={() => handleGroupClick(group.groupId)}>
              <span>{group.name}</span>
            </button>
          );
        })}
    </DropdownMenu>
  );
}
