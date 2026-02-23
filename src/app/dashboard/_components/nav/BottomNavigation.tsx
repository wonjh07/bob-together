'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import IconStackLabel from '@/components/ui/IconStackLabel';

import * as styles from './BottomNavigation.css';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: '홈', icon: '🏠' },
    { href: '/dashboard/appointments', label: '약속', icon: '📅' },
    { href: '/dashboard/appointments/create', label: '새 약속', icon: '➕' },
    { href: '/dashboard/search', label: '검색', icon: '🔍' },
    { href: '/dashboard/profile', label: '내 정보', icon: '👤' },
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
          <IconStackLabel
            as="span"
            className={styles.navItemStack}
            icon={item.icon}
            iconClassName={styles.navIcon}
            label={item.label}
            labelClassName={styles.navLabel}
          />
        </Link>
      ))}
    </nav>
  );
}
