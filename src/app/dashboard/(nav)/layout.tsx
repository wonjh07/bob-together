import { BottomNav } from '@/app/dashboard/_components/nav/BottomNavigation';
import { TopNav } from '@/app/dashboard/_components/nav/TopNavigation';

import * as styles from './layout.css';

export default function DashboardNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <TopNav />
      {children}
      <BottomNav />
    </div>
  );
}
