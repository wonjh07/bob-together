
import { BottomNav } from '@/app/(app)/components/bottomNav';
import { KakaoMapPreload } from '@/components/kakao/KakaoMapPreload';

import { layoutContainer } from './layout.css';

export default async function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className={layoutContainer}>
      <KakaoMapPreload />
      {children}
      <BottomNav />
    </div>
  );
}
