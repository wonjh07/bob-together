import { redirect } from 'next/navigation';

import { getMyGroupsAction } from '@/actions/group';

import { AppointmentList } from './components/AppointmentList';
import { dashboardContainer } from './page.css';

export default async function DashboardPage() {
  const groupResult = await getMyGroupsAction();

  if (groupResult.ok && groupResult.data?.groups.length === 0) {
    redirect('/group');
  }

  return (
    <div className={dashboardContainer}>
      <AppointmentList />
    </div>
  );
}
