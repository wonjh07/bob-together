import { getMyGroupsAction } from '@/actions/group';
import { CreateAppointmentProvider } from '@/provider/create-appointment-context';
import { getSelectedGroupIdFromCookies } from '@/server/groupSelection';

export default async function CreateAppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getMyGroupsAction();
  const groups = result.ok && result.data ? result.data.groups : [];
  const selectedGroupId = getSelectedGroupIdFromCookies();
  const initialGroupId =
    selectedGroupId && groups.some((group) => group.groupId === selectedGroupId)
      ? selectedGroupId
      : groups.length > 0
        ? groups[0].groupId
        : null;

  return (
    <CreateAppointmentProvider
      initialGroups={groups}
      initialGroupId={initialGroupId}>
      {children}
    </CreateAppointmentProvider>
  );
}
