import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

import { getMyGroupsAction } from '@/actions/group';
import { AppointmentList } from '@/app/dashboard/_components/AppointmentList';
import { DashboardHeader } from '@/app/dashboard/_components/DashboardHeader';
import { createAppointmentListQueryOptions } from '@/libs/query/appointmentQueries';
import { getServerQueryScope } from '@/libs/query/getServerQueryScope';
import { createMyGroupsQueryOptions } from '@/libs/query/groupQueries';
import { getSelectedGroupCookie } from '@/libs/server/groupSelection';
import { GroupProvider } from '@/provider/group-provider';

import * as styles from './page.css';

function resolveInitialGroupId(
  groups: Array<{ groupId: string }>,
  selectedGroupId: string | null,
) {
  if (!selectedGroupId) {
    return groups[0]?.groupId ?? null;
  }

  if (groups.some((group) => group.groupId === selectedGroupId)) {
    return selectedGroupId;
  }

  return groups[0]?.groupId ?? null;
}

export default async function DashboardPage() {
  const groupResult = await getMyGroupsAction();
  const groups =
    groupResult.ok && groupResult.data ? groupResult.data.groups : [];

  if (groupResult.ok && groups.length === 0) {
    redirect('/group');
  }

  const selectedGroupId = await getSelectedGroupCookie();
  const initialGroupId = resolveInitialGroupId(groups, selectedGroupId);

  const queryClient = new QueryClient();
  const queryScope = await getServerQueryScope();
  const myGroupsQueryOptions = createMyGroupsQueryOptions(queryScope);

  if (groupResult.ok && groupResult.data) {
    queryClient.setQueryData(myGroupsQueryOptions.queryKey, groups);
  } else {
    await queryClient.prefetchQuery(myGroupsQueryOptions);
  }

  if (initialGroupId) {
    await queryClient.prefetchInfiniteQuery(
      createAppointmentListQueryOptions(initialGroupId, 'all', 'all', queryScope),
    );
  }

  return (
    <GroupProvider initialGroupId={initialGroupId}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className={styles.dashboardContainer}>
          <DashboardHeader />
          <AppointmentList />
        </div>
      </HydrationBoundary>
    </GroupProvider>
  );
}
