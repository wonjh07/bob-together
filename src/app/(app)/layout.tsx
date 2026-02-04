import { BottomNav } from '@/app/(app)/_components/bottomNav';
import { TopNav } from '@/app/(app)/_components/topNav';

import { layoutContainer } from './layout.css';

export default async function dashboardLayout({
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
