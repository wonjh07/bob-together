'use client';

import Image from 'next/image';
import Link from 'next/link';

import BellIcon from '@/components/icons/BellIcon';

import {
  topNav,
  logoSection,
  navRight,
  iconButton,
  bellIcon,
  menuButton,
  menuIcon,
} from './TopNavigation.css';
import { ProfileDropdown } from './ui/ProfileDrop';

export function TopNav() {
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
        <ProfileDropdown
          triggerClassName={menuButton}
          triggerIconClassName={menuIcon}
        />
      </div>
    </header>
  );
}
