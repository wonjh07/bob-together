'use client';

import { usePathname, useRouter } from 'next/navigation';

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
  const pathname = usePathname();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const normalizedPath = (pathname || '/').replace(/\/+$/, '') || '/';
    if (normalizedPath === '/') {
      router.back();
      return;
    }

    const lastSlashIndex = normalizedPath.lastIndexOf('/');
    const parentPath =
      lastSlashIndex <= 0 ? '/' : normalizedPath.slice(0, lastSlashIndex);

    if (!parentPath || parentPath === normalizedPath) {
      router.back();
      return;
    }

    router.push(parentPath);
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
          onClick={onRightAction}
          aria-label={rightAriaLabel}
          disabled={rightDisabled}>
          {rightLabel}
        </button>
      )}
    </div>
  );
}
