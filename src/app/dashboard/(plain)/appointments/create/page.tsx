import { getSelectedGroupCookie } from '@/libs/server/groupSelection';

import MultiStepFormClient from './MultiStepFormClient';
import { page } from './page.css';

export default async function AppointmentCreatePage() {
  const initialGroupId = (await getSelectedGroupCookie()) ?? null;

  return (
    <div className={page}>
      <MultiStepFormClient initialGroupId={initialGroupId} />
    </div>
  );
}
