'use client';

import { useRouter } from 'next/navigation';

import * as styles from './AppointmentEditTopNav.css';

interface AppointmentEditTopNavProps {
  onComplete?: () => void;
  isSubmitting?: boolean;
}

export default function AppointmentEditTopNav({
  onComplete,
  isSubmitting = false,
}: AppointmentEditTopNavProps) {
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
      <div className={styles.title}>약속 수정</div>
      <button
        type="button"
        className={styles.completeButton}
        onClick={onComplete}
        aria-label="수정 완료"
        disabled={!onComplete || isSubmitting}>
        {isSubmitting ? '저장중' : '완료'}
      </button>
    </div>
  );
}
