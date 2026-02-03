'use client';

import Image from 'next/image';
import { useState } from 'react';

import { useGroupContext } from '@/provider/group-provider';

import { topNav, logoSection, navRight, userIcon } from './topNav.css';
import { GroupDropdown } from './ui/groupDropdown';
import { ProfileDropdown } from './ui/profileDropdown';

export function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { groups, currentGroupId, setCurrentGroupId, currentGroupName } =
    useGroupContext();

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
