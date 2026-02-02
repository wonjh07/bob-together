'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { getMyGroupsAction } from '@/actions/group';

import { topNav, logoSection, navRight, userIcon } from './topNav.css';
import { GroupDropdown } from './ui/groupDropdown';
import { ProfileDropdown } from './ui/profileDropdown';

import type { GroupSummary } from '@/actions/group';

export function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const currentGroupName = useMemo(() => {
    if (!currentGroupId) {
      return groups.length > 0 ? groups[0].name : '그룹 선택';
    }
    const selected = groups.find((group) => group.groupId === currentGroupId);
    return selected?.name || '그룹 선택';
  }, [groups, currentGroupId]);

  useEffect(() => {
    let isActive = true;

    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      const result = await getMyGroupsAction();
      setIsLoadingGroups(false);

      if (!isActive) {
        return;
      }

      if (!result.ok) {
        setGroups([]);
        setCurrentGroupId(null);
        return;
      }

      if (!result.data) {
        setGroups([]);
        setCurrentGroupId(null);
        return;
      }

      const nextGroups = result.data.groups;
      setGroups(nextGroups);
      if (nextGroups.length > 0) {
        setCurrentGroupId((prev) => prev ?? nextGroups[0].groupId);
      }
    };

    fetchGroups();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <header className={topNav}>
      <div className={logoSection}>
        <Image
          src="/loginImage.png"
          alt="Login Image"
          loading="eager"
          width={40}
          height={40}
        />
        <span>밥투게더</span>
      </div>

      <div className={navRight}>
        <GroupDropdown
          isOpen={isDropdownOpen}
          onOpenChange={(open) => {
            setIsProfileDropdownOpen(false);
            setIsDropdownOpen(open);
          }}
          groups={groups}
          currentGroupId={currentGroupId}
          currentGroupName={currentGroupName}
          isLoading={isLoadingGroups}
          onGroupSelect={setCurrentGroupId}
        />

        <button
          className={userIcon}
          onClick={() => {
            setIsDropdownOpen(false);
            setIsProfileDropdownOpen(!isProfileDropdownOpen);
          }}>
          <Image
            src="/profileImage.png"
            alt="사용자"
            width={44}
            height={44}
            priority
          />
        </button>
      </div>

      <ProfileDropdown
        isOpen={isProfileDropdownOpen}
        onOpenChange={setIsProfileDropdownOpen}
      />
    </header>
  );
}
