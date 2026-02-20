'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import BellIcon from '@/components/icons/BellIcon';

import {
  topNav,
  logoSection,
  navRight,
  iconButton,
  bellIcon,
  userIcon,
} from './TopNavigation.css';
import { ProfileDropdown } from './ui/ProfileDrop';

export function TopNav() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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
        <Link
          href="/dashboard/notifications"
          className={iconButton}
          aria-label="알림 페이지로 이동">
          <BellIcon className={bellIcon} />
        </Link>
        <button
          className={userIcon}
          onClick={() => {
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
