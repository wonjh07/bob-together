import { redirect } from 'next/navigation';

import { getMyGroupsAction } from '@/actions/group';
import { getSelectedGroupIdFromCookies } from '@/libs/server/groupSelection';
import { GroupProvider } from '@/provider/group-provider';

import { AppointmentList } from './_components/AppointmentList';
import { DashboardHeader } from './_components/DashboardHeader';
import { dashboardContainer } from './page.css';

export default async function DashboardPage() {
  const groupResult = await getMyGroupsAction();
  const groups =
    groupResult.ok && groupResult.data ? groupResult.data.groups : [];

  if (groupResult.ok && groups.length === 0) {
    redirect('/group');
  }

  const selectedGroupId = getSelectedGroupIdFromCookies();
  const initialGroupId =
    selectedGroupId && groups.some((group) => group.groupId === selectedGroupId)
      ? selectedGroupId
      : groups.length > 0
        ? groups[0].groupId
        : null;

  return (
    <GroupProvider initialGroups={groups} initialGroupId={initialGroupId}>
      <div className={dashboardContainer}>
        <DashboardHeader />
        <AppointmentList />
      </div>
    </GroupProvider>
  );
}
