'use client';

import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
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

interface GroupItemsProps {
  groups: GroupSummary[];
  currentGroupId?: string | null;
  isSelectable: boolean;
  onGroupClick: (groupId: string) => void;
}

function LoadingContent() {
  return <div className={styles.dropdownEmpty}>불러오는 중...</div>;
}

function EmptyContent() {
  return <div className={styles.dropdownEmpty}>가입한 그룹이 없습니다.</div>;
}

function GroupItems({
  groups,
  currentGroupId,
  isSelectable,
  onGroupClick,
}: GroupItemsProps) {
  return (
    <>
      {groups.map((group) => {
        const isActive = group.groupId === currentGroupId;

        return (
          <button
            key={group.groupId}
            type="button"
            role="menuitemradio"
            aria-checked={isActive}
            className={styles.dropdownItem[isActive ? 'selected' : 'default']}
            onClick={() => onGroupClick(group.groupId)}
            disabled={!isSelectable}
            title={group.name}>
            <span className={styles.dropdownItemLabel}>{group.name}</span>
          </button>
        );
      })}
    </>
  );
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
  const isSelectable = Boolean(onGroupSelect);

  const handleGroupClick = (groupId: string) => {
    if (!onGroupSelect) return;
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
          className={styles.groupButton[triggerOpen ? 'open' : 'closed']}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={triggerOpen}
          aria-label={`현재 그룹: ${currentGroupName}. 그룹 목록 열기`}
          title={currentGroupName}>
          <span className={styles.groupButtonLabel} title={currentGroupName}>
            {currentGroupName}
          </span>
          <ChevronDownIcon
            className={styles.chevronIcon[triggerOpen ? 'open' : 'closed']}
          />
        </button>
      )}>
      <div role="menu" aria-label="그룹 목록">
        {isLoading ? <LoadingContent /> : null}
        {!isLoading && groups.length === 0 ? <EmptyContent /> : null}
        {!isLoading && groups.length > 0 ? (
          <GroupItems
            groups={groups}
            currentGroupId={currentGroupId}
            isSelectable={isSelectable}
            onGroupClick={handleGroupClick}
          />
        ) : null}
      </div>
    </DropdownMenu>
  );
}
