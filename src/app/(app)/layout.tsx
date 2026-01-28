'use client';

import { BottomNav } from '@/app/(app)/components/bottomNav';
import { TopNav } from '@/app/(app)/components/topNav';

import { layoutContainer } from './layout.css';

export default function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={layoutContainer}>
      <TopNav />
      {children}
      <BottomNav />
    </div>
  );
}
