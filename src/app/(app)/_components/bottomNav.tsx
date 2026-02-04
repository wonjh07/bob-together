'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { bottomNav, navItem, active } from './bottomNav.css';

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
    <nav className={bottomNav}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${navItem} ${pathname === item.href ? active : ''}`}>
          <div className="icon">{item.icon}</div>
          <div className="label">{item.label}</div>
        </Link>
      ))}
    </nav>
  );
}
