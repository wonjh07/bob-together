'use client';

import { useRouter } from 'next/navigation';

import * as styles from './PlainTopNav.css';

interface PlainTopNavProps {
  title: string;
  onBack?: () => void;
  backAriaLabel?: string;
  rightLabel?: string;
  onRightAction?: () => void;
  rightAriaLabel?: string;
  rightDisabled?: boolean;
  rightHidden?: boolean;
}

export default function PlainTopNav({
  title,
  onBack,
  backAriaLabel = '뒤로가기',
  rightLabel,
  onRightAction,
  rightAriaLabel,
  rightDisabled = false,
  rightHidden = false,
}: PlainTopNavProps) {
  const router = useRouter();

  return (
    <div className={styles.topNav}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack ?? (() => router.back())}
        aria-label={backAriaLabel}>
        &lt;
      </button>
      <div className={styles.title}>{title}</div>
      {rightHidden ? (
        <div className={styles.spacer} aria-hidden="true" />
      ) : (
        <button
          type="button"
          className={styles.rightButton}
          onClick={onRightAction}
          aria-label={rightAriaLabel}
          disabled={rightDisabled}>
          {rightLabel}
        </button>
      )}
    </div>
  );
}
