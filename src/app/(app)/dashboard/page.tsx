import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

import { getMyGroupsAction } from '@/actions/group';
import { createAppointmentListQueryOptions } from '@/libs/query/appointmentQueries';
import { createMyGroupsQueryOptions } from '@/libs/query/groupQueries';
import { getSelectedGroupIdFromCookies } from '@/libs/server/groupSelection';
import { GroupProvider } from '@/provider/group-provider';

import { AppointmentList } from './_components/AppointmentList';
import { DashboardHeader } from './_components/DashboardHeader';
import * as styles from './page.css';

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

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(createMyGroupsQueryOptions());

  if (initialGroupId) {
    await queryClient.prefetchInfiniteQuery(
      createAppointmentListQueryOptions(initialGroupId, 'all', 'all'),
    );
  }

  return (
    <GroupProvider initialGroupId={initialGroupId}>
      <div className={styles.dashboardContainer}>
        <DashboardHeader />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <AppointmentList />
        </HydrationBoundary>
      </div>
    </GroupProvider>
  );
}
