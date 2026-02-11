'use client';

import { useRouter } from 'next/navigation';

import * as styles from './AppointmentMembersTopNav.css';

export default function AppointmentMembersTopNav() {
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
      <div className={styles.title}>약속 멤버</div>
      <div className={styles.spacer} aria-hidden="true" />
    </div>
  );
}
