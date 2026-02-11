'use client';

import { useRouter } from 'next/navigation';

import * as styles from './AppointmentDetailTopNav.css';

interface AppointmentDetailTopNavProps {
  appointmentId: string;
  canEdit: boolean;
}

export default function AppointmentDetailTopNav({
  appointmentId,
  canEdit,
}: AppointmentDetailTopNavProps) {
  const router = useRouter();

  return (
    <div className={styles.topNav}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => router.back()}
        aria-label="뒤로가기">
        &lt;
      </button>
      <div className={styles.title}>약속 상세</div>
      {canEdit ? (
        <button
          type="button"
          className={styles.editButton}
          aria-label="약속 수정"
          onClick={() => router.push(`/dashboard/appointments/${appointmentId}/edit`)}>
          수정
        </button>
      ) : (
        <div className={styles.spacer} aria-hidden="true" />
      )}
    </div>
  );
}
