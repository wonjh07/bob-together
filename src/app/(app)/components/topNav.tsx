'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { topNav, logoSection, navRight, userIcon } from './topNav.css';
import { GroupDropdown } from './ui/groupDropdown';
import { ProfileDropdown } from './ui/profileDropdown';

import type { GroupSummary } from '@/actions/group';

interface TopNavProps {
  initialGroups: GroupSummary[];
  initialGroupId: string | null;
}

export function TopNav({ initialGroups, initialGroupId }: TopNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(
    initialGroupId ?? initialGroups[0]?.groupId ?? null,
  );

  const currentGroupName = useMemo(() => {
    if (!currentGroupId) {
      return initialGroups.length > 0 ? initialGroups[0].name : '그룹 선택';
    }
    const selected = initialGroups.find(
      (group) => group.groupId === currentGroupId,
    );
    return selected?.name || '그룹 선택';
  }, [initialGroups, currentGroupId]);

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
          groups={initialGroups}
          currentGroupId={currentGroupId}
          currentGroupName={currentGroupName}
          isLoading={false}
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
