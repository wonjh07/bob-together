import { getMyGroupsAction } from '@/actions/group';

import { CreateAppointmentProvider } from './create-appointment-context';

export default async function CreateAppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getMyGroupsAction();
  const groups = result.ok && result.data ? result.data.groups : [];
  const initialGroupId = groups.length > 0 ? groups[0].groupId : null;

  return (
    <CreateAppointmentProvider
      initialGroups={groups}
      initialGroupId={initialGroupId}>
      {children}
    </CreateAppointmentProvider>
  );
}
