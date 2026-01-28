'use client';

import Image from 'next/image';
import { useState } from 'react';

import {
  topNav,
  logoSection,
  navRight,
  groupDropdown,
  groupButton,
  dropdownMenu,
  dropdownItem,
  userIcon,
} from './topNav.css';

export function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        <div className={groupDropdown}>
          <button
            className={groupButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            그룹1 <span>▼</span>
          </button>
          {isDropdownOpen && (
            <div className={dropdownMenu}>
              <a className={dropdownItem} href="#group1">
                그룹1
              </a>
              <a className={dropdownItem} href="#group2">
                그룹2
              </a>
              <a className={dropdownItem} href="#group3">
                그룹3
              </a>
            </div>
          )}
        </div>

        <button className={userIcon}>
          <Image
            src="/profileImage.png"
            alt="사용자"
            width={44}
            height={44}
            priority
          />
        </button>
      </div>
    </header>
  );
}
