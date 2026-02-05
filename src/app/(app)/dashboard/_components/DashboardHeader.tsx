'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { GroupDropdown } from '@/app/(app)/dashboard/_components/GroupsDropdown';
import { createMyGroupsQueryOptions } from '@/libs/query/groupQueries';
import { useGroupContext } from '@/provider/group-provider';

import * as styles from './DashboardHeader.css';

export function DashboardHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentGroupId, setCurrentGroupId } = useGroupContext();
  const { data: groups = [], isLoading } = useQuery(
    createMyGroupsQueryOptions(),
  );

  const currentGroupName =
    groups.find((group) => group.groupId === currentGroupId)?.name ??
    '그룹 선택';

  return (
    <div className={styles.header}>
      <div className={styles.headerTitle}>대시보드</div>
      <GroupDropdown
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        groups={groups}
        currentGroupId={currentGroupId}
        currentGroupName={currentGroupName}
        isLoading={isLoading}
        onGroupSelect={setCurrentGroupId}
      />
    </div>
  );
}
