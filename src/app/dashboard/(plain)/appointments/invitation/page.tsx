import Link from 'next/link';

import AppointmentInvitationClient from './AppointmentInvitationClient';
import {
  invitationPage,
  invitationPanel,
  headerRow,
  headerTitle,
  headerMeta,
  actionLink,
} from './page.css';

type AppointmentInvitationPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AppointmentInvitationPage({
  searchParams,
}: AppointmentInvitationPageProps) {
  const appointmentId =
    typeof searchParams?.appointmentId === 'string'
      ? searchParams.appointmentId
      : '';
  const appointmentTitle =
    typeof searchParams?.title === 'string' ? searchParams.title : '';

  const completeHref = appointmentId
    ? `/dashboard/appointments/invitation/complete?appointmentId=${appointmentId}&title=${encodeURIComponent(
        appointmentTitle,
      )}`
    : '/dashboard/appointments/invitation/complete';

  return (
    <div className={invitationPage}>
      <div className={invitationPanel}>
        {appointmentTitle && (
          <div className={headerMeta}>{appointmentTitle}</div>
        )}
        <div className={headerRow}>
          <div>
            <div className={headerTitle}>그룹원을 검색하고 초대해주세요</div>
          </div>
          <Link href={completeHref} className={actionLink}>
            완료
          </Link>
        </div>
        <AppointmentInvitationClient appointmentId={appointmentId} />
      </div>
    </div>
  );
}
