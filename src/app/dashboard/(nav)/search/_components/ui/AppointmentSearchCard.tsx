import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import UserCircleIcon from '@/components/icons/UserCircleIcon';

import * as styles from './AppointmentSearchCard.css';

interface AppointmentSearchCardProps {
  title: string;
  date: string;
  timeRange: string;
  hostName: string;
  memberCount: number;
}

export default function AppointmentSearchCard({
  title,
  date,
  timeRange,
  hostName,
  memberCount,
}: AppointmentSearchCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.row}>
          <div className={styles.item}>
            <CalendarIcon width="18" height="18" />
            <span>{date}</span>
          </div>
          <div className={styles.item}>
            <ClockIcon width="18" height="18" />
            <span>{timeRange}</span>
          </div>
        </div>
        <div className={styles.subRow}>
          <span className={styles.userIcon}>
            <UserCircleIcon width="20" height="20" />
          </span>
          <span>
            {hostName} / {memberCount}명
          </span>
        </div>
      </div>
      <button type="button" className={styles.detailButton}>
        상세 정보
      </button>
    </div>
  );
}
