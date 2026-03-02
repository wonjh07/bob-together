import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import { formatDateDot, formatTimeRange24 } from '@/utils/dateFormat';

import * as styles from './DateTimeMetaRow.css';

const ICON_SIZE = 18;

interface DateTimeMetaRowProps {
  startAt: string;
  endsAt: string;
  direction?: 'row' | 'column';
}

export default function DateTimeMetaRow({
  startAt,
  endsAt,
  direction = 'row',
}: DateTimeMetaRowProps) {
  const date = formatDateDot(startAt);
  const timeRange = formatTimeRange24(startAt, endsAt);

  return (
    <div className={`${styles.rowBase} ${styles.rowDirection[direction]}`}>
      <div className={styles.item}>
        <CalendarIcon className={styles.icon} size={ICON_SIZE} />
        <span>{date}</span>
      </div>
      <div className={styles.item}>
        <ClockIcon className={styles.icon} size={ICON_SIZE} />
        <span>{timeRange}</span>
      </div>
    </div>
  );
}
