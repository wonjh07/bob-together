import { getMyGroupsAction } from '@/actions/group';
import { BottomNav } from '@/app/(app)/components/bottomNav';
import { TopNav } from '@/app/(app)/components/topNav';
import { KakaoMapPreload } from '@/components/kakao/KakaoMapPreload';
import { GroupProvider } from '@/provider/group-provider';

import { layoutContainer } from './layout.css';

export default async function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getMyGroupsAction();
  const groups = result.ok && result.data ? result.data.groups : [];
  const initialGroupId = groups.length > 0 ? groups[0].groupId : null;

  return (
    <div className={layoutContainer}>
      <KakaoMapPreload />
      <GroupProvider initialGroups={groups} initialGroupId={initialGroupId}>
        <TopNav />
        {children}
      </GroupProvider>
      <BottomNav />
    </div>
  );
}
