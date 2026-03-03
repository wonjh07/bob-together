'use client';

import { useRouter } from 'next/navigation';

import { canUseHistoryBack } from '@/utils/navigationBack';

import * as styles from './PlainTopNav.css';

interface PlainTopNavProps {
  title: string;
  onBack?: () => void;
  backHref?: string;
  backBehavior?: 'auto' | 'history' | 'href';
  backAriaLabel?: string;
  rightLabel?: string;
  onRightAction?: () => void;
  rightHref?: string;
  rightAriaLabel?: string;
  rightDisabled?: boolean;
  rightHidden?: boolean;
}

export default function PlainTopNav({
  title,
  onBack,
  backHref,
  backBehavior = 'auto',
  backAriaLabel = '뒤로가기',
  rightLabel,
  onRightAction,
  rightHref,
  rightAriaLabel,
  rightDisabled = false,
  rightHidden = false,
}: PlainTopNavProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (backBehavior === 'href') {
      router.replace(backHref || '/dashboard');
      return;
    }

    if (backBehavior !== 'history') {
      if (canUseHistoryBack()) {
        router.back();
        return;
      }
    } else if (canUseHistoryBack()) {
      router.back();
      return;
    }

    router.replace(backHref || '/dashboard');
  };

  return (
    <div className={styles.topNav}>
      <button
        type="button"
        className={styles.backButton}
        onClick={handleBack}
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
          onClick={() => {
            if (onRightAction) {
              onRightAction();
              return;
            }
            if (rightHref) {
              router.push(rightHref);
            }
          }}
          aria-label={rightAriaLabel}
          disabled={rightDisabled}>
          {rightLabel}
        </button>
      )}
    </div>
  );
}
