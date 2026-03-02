import Link from 'next/link';

import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import IconLabel from '@/components/ui/IconLabel';
import UserIdentityInline from '@/components/ui/UserIdentityInline';

import * as styles from './AppointmentSearchCard.css';

interface AppointmentSearchCardProps {
  appointmentId: string;
  title: string;
  startAt: string;
  endsAt: string;
  hostName: string;
  hostProfileImage: string | null;
  memberCount: number;
}

export default function AppointmentSearchCard({
  appointmentId,
  title,
  startAt,
  endsAt,
  hostName,
  hostProfileImage,
  memberCount,
}: AppointmentSearchCardProps) {
  return (
    <Link
      href={`/dashboard/appointments/${appointmentId}`}
      prefetch={false}
      className={styles.card}>
      <div className={styles.info}>
        <UserIdentityInline
          name={hostName}
          avatarSrc={hostProfileImage}
          avatarAlt={`${hostName} 프로필`}
          size="sm"
        />
        <div className={styles.title}>{title}</div>
        <DateTimeMetaRow startAt={startAt} endsAt={endsAt} />
        <IconLabel as="span" icon="group" count={`${memberCount}명`} />
      </div>
    </Link>
  );
}
