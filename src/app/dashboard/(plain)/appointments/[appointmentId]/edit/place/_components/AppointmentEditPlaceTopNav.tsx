'use client';

import { useRouter } from 'next/navigation';

import * as styles from './AppointmentEditPlaceTopNav.css';

export default function AppointmentEditPlaceTopNav() {
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
      <div className={styles.title}>장소 검색</div>
      <div className={styles.spacer} aria-hidden="true" />
    </div>
  );
}
