import { getMyGroupsAction } from '@/actions/group';
import { getSelectedGroupIdFromCookies } from '@/libs/server/groupSelection';
import { CreateAppointmentProvider } from '@/provider/create-appointment-context';

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
