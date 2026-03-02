'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { GroupDropdown } from '@/app/dashboard/_components/GroupsDropdown';
import { createMyGroupsQueryOptions } from '@/libs/query/groupQueries';
import { useGroupContext } from '@/provider/group-provider';
import { useQueryScope } from '@/provider/query-scope-provider';

import * as styles from './DashboardHeader.css';

export function DashboardHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentGroupId, setCurrentGroupId } = useGroupContext();
  const queryScope = useQueryScope();
  const { data: groups = [], isLoading } = useQuery(
    createMyGroupsQueryOptions(queryScope),
  );

  const currentGroupName = useMemo(
    () =>
      groups.find((group) => group.groupId === currentGroupId)?.name ??
      '그룹 선택',
    [currentGroupId, groups],
  );

  return (
    <div className={styles.header}>
      <h2 className={styles.headerTitle}>대시보드</h2>
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
