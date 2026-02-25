import * as styles from './InlineLoading.css';
import LoadingSpinner from './LoadingSpinner';

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export default function InlineLoading({
  text = '로딩 중...',
  className,
}: InlineLoadingProps) {
  return (
    <div className={className}>
      <span className={styles.row}>
        <LoadingSpinner
          size={16}
          thickness={2}
          tone="subtle"
          ariaLabel={text}
        />
        <span className={styles.text}>{text}</span>
      </span>
    </div>
  );
}
