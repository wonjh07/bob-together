'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import CalendarIcon from '@/components/icons/CalendarIcon';
import HomeIcon from '@/components/icons/HomeIcon';
import PlusCircleIcon from '@/components/icons/PlusCircleIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import UserCircleIcon from '@/components/icons/UserCircleIcon';

import * as styles from './BottomNavigation.css';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: '홈',
      icon: <HomeIcon className={styles.navIcon} />,
    },
    {
      href: '/dashboard/appointments',
      label: '약속',
      icon: <CalendarIcon className={styles.navIcon} />,
    },
    {
      href: '/dashboard/appointments/create',
      label: '새 약속',
      icon: <PlusCircleIcon className={styles.navIcon} />,
    },
    {
      href: '/dashboard/search',
      label: '검색',
      icon: <SearchIcon className={styles.navIcon} />,
    },
    {
      href: '/dashboard/profile',
      label: '내 정보',
      icon: <UserCircleIcon className={styles.navIcon} />,
    },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navItem} ${
            pathname === item.href ? styles.active : ''
          }`}>
          <span className={styles.navItemContent}>
            <span className={styles.navIconWrap}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
