'use client';

import { useRouter } from 'next/navigation';

import * as styles from './DetailPageTopNav.css';

interface DetailPageTopNavProps {
  title: string;
  onComplete?: () => void;
  isSubmitting?: boolean;
}

export default function DetailPageTopNav({
  title,
  onComplete,
  isSubmitting = false,
}: DetailPageTopNavProps) {
  const router = useRouter();

  return (
    <div className={styles.movebackContainer}>
      <button
        className={styles.movebackButton}
        onClick={() => router.back()}
        aria-label="뒤로가기">
        &lt;
      </button>
      <div className={styles.title}>{title}</div>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={onComplete}
        disabled={isSubmitting}>
        완료
      </button>
    </div>
  );
}
