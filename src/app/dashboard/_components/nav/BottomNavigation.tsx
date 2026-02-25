'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AiOutlineCalendar,
  AiOutlineHome,
  AiOutlinePlusCircle,
  AiOutlineSearch,
  AiOutlineUser,
} from 'react-icons/ai';

import * as styles from './BottomNavigation.css';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: '홈',
      icon: <AiOutlineHome className={styles.navIcon} aria-hidden="true" />,
    },
    {
      href: '/dashboard/appointments',
      label: '약속',
      icon: <AiOutlineCalendar className={styles.navIcon} aria-hidden="true" />,
    },
    {
      href: '/dashboard/appointments/create',
      label: '새 약속',
      icon: <AiOutlinePlusCircle className={styles.navIcon} aria-hidden="true" />,
    },
    {
      href: '/dashboard/search',
      label: '검색',
      icon: <AiOutlineSearch className={styles.navIcon} aria-hidden="true" />,
    },
    {
      href: '/dashboard/profile',
      label: '내 정보',
      icon: <AiOutlineUser className={styles.navIcon} aria-hidden="true" />,
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
