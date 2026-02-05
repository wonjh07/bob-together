import { getSelectedGroupIdFromCookies } from '@/libs/server/groupSelection';

import MultiStepFormClient from './MultiStepFormClient';
import { page, panel } from './page.css';

export default async function AppointmentCreatePage() {
  const initialGroupId = getSelectedGroupIdFromCookies() ?? null;

  return (
    <div className={page}>
      <div className={panel}>
        <MultiStepFormClient initialGroupId={initialGroupId} />
      </div>
    </div>
  );
}
