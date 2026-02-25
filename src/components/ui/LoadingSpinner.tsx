import * as styles from './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: number;
  thickness?: number;
  tone?: 'main' | 'subtle';
  className?: string;
  ariaLabel?: string;
}

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export default function LoadingSpinner({
  size = 32,
  thickness = 3,
  tone = 'main',
  className,
  ariaLabel = '로딩 중',
}: LoadingSpinnerProps) {
  return (
    <span className={cx(styles.root, className)} role="status" aria-live="polite">
      <span
        className={cx(styles.spinner, tone === 'subtle' && styles.spinnerSubtle)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderWidth: `${thickness}px`,
        }}
        aria-hidden="true"
      />
      <span className={styles.srOnly}>{ariaLabel}</span>
    </span>
  );
}
