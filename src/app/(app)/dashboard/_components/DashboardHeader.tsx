'use client';

import { useState } from 'react';

import { GroupDropdown } from '@/app/(app)/dashboard/_components/groupDropdown';
import { useGroupContext } from '@/provider/group-provider';

import { header, headerTitle } from '../page.css';

export function DashboardHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { groups, currentGroupId, setCurrentGroupId, currentGroupName } =
    useGroupContext();

  return (
    <div className={header}>
      <div className={headerTitle}>대시보드</div>
      <GroupDropdown
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        groups={groups}
        currentGroupId={currentGroupId}
        currentGroupName={currentGroupName}
        isLoading={false}
        onGroupSelect={setCurrentGroupId}
      />
    </div>
  );
}
