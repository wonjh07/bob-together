import AppointmentInvitationClient from './AppointmentInvitationClient';

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
    <AppointmentInvitationClient
      appointmentId={appointmentId}
      appointmentTitle={appointmentTitle}
      completeHref={completeHref}
    />
  );
}
