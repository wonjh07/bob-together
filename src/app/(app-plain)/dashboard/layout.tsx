import { BottomNav } from '@/app/(app)/_components/BottomNavigation';

import { layoutContainer } from './layout.css';

export default async function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={layoutContainer}>
      {children}
      <BottomNav />
    </div>
  );
}
