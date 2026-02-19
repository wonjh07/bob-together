import AppointmentInvitationClient from './AppointmentInvitationClient';
import AppointmentInvitationTopNav from './AppointmentInvitationTopNav';
import {
  invitationPage,
  invitationPanel,
  headerMeta,
  headerDescription,
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
    ? `/dashboard/appointments/${appointmentId}`
    : '/dashboard/appointments';

  return (
    <div className={invitationPage}>
      <AppointmentInvitationTopNav completeHref={completeHref} />
      <div className={invitationPanel}>
        {appointmentTitle && (
          <div className={headerMeta}>{appointmentTitle}</div>
        )}
        <div className={headerDescription}>그룹원을 검색하고 초대해주세요</div>
        <AppointmentInvitationClient appointmentId={appointmentId} />
      </div>
    </div>
  );
}
