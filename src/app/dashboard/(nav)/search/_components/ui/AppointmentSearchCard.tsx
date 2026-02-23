import Link from 'next/link';

import GroupIcon from '@/components/icons/GroupIcon';
import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import IconLabel from '@/components/ui/IconLabel';
import UserIdentityInline from '@/components/ui/UserIdentityInline';

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
        <DateTimeMetaRow
          date={date}
          timeRange={timeRange}
          rowClassName={styles.row}
          itemClassName={styles.item}
          dateIconSize={18}
          timeIconSize={18}
        />
        <div className={styles.subRow}>
          <UserIdentityInline
            name={hostName}
            avatarSrc={hostProfileImage}
            avatarAlt={`${hostName} 프로필`}
            avatarSize="xs"
            rowClassName={styles.hostIdentity}
            avatarClassName={styles.hostAvatar}
            nameClassName={styles.hostName}
          />
          <IconLabel
            as="span"
            className={styles.memberMeta}
            icon={<GroupIcon width="16" height="16" />}>
            {memberCount}명
          </IconLabel>
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
