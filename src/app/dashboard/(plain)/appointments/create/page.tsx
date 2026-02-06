import { getSelectedGroupIdFromCookies } from '@/libs/server/groupSelection';

import MultiStepFormClient from './MultiStepFormClient';
import { page } from './page.css';

export default async function AppointmentCreatePage() {
  const initialGroupId = getSelectedGroupIdFromCookies() ?? null;

  return (
    <div className={page}>
      <MultiStepFormClient initialGroupId={initialGroupId} />
    </div>
  );
}
