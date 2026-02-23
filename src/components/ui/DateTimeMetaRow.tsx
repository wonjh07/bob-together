import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';

import * as styles from './DateTimeMetaRow.css';

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

interface DateTimeMetaRowProps {
  date: string;
  timeRange: string;
  direction?: 'row' | 'column';
  rowClassName?: string;
  itemClassName?: string;
  iconClassName?: string;
  dateIconSize?: number;
  timeIconSize?: number;
}

export default function DateTimeMetaRow({
  date,
  timeRange,
  direction = 'row',
  rowClassName,
  itemClassName,
  iconClassName,
  dateIconSize = 18,
  timeIconSize = 18,
}: DateTimeMetaRowProps) {
  return (
    <div className={cx(styles.rowBase, styles.rowDirection[direction], rowClassName)}>
      <div className={cx(styles.item, itemClassName)}>
        <CalendarIcon
          className={cx(styles.icon, iconClassName)}
          width={dateIconSize}
          height={dateIconSize}
        />
        <span>{date}</span>
      </div>
      <div className={cx(styles.item, itemClassName)}>
        <ClockIcon
          className={cx(styles.icon, iconClassName)}
          width={timeIconSize}
          height={timeIconSize}
        />
        <span>{timeRange}</span>
      </div>
    </div>
  );
}
