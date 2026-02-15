import Image from 'next/image';
import Link from 'next/link';

import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import GroupIcon from '@/components/icons/GroupIcon';

import * as styles from './AppointmentSearchCard.css';

interface AppointmentSearchCardProps {
  appointmentId: string;
  title: string;
  date: string;
  timeRange: string;
  hostName: string;
  hostProfileImage: string | null;
  memberCount: number;
}

export default function AppointmentSearchCard({
  appointmentId,
  title,
  date,
  timeRange,
  hostName,
  hostProfileImage,
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
          <Image
            src={hostProfileImage || '/profileImage.png'}
            alt={`${hostName} 프로필`}
            width={28}
            height={28}
            className={styles.hostAvatar}
          />
          <span className={styles.hostName}>{hostName}</span>
          <span className={styles.memberMeta}>
            <GroupIcon width="16" height="16" />
            {memberCount}명
          </span>
        </div>
      </div>
      <Link
        href={`/dashboard/appointments/${appointmentId}`}
        className={styles.detailButton}>
        상세 정보
      </Link>
    </div>
  );
}
