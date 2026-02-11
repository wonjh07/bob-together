import { redirect } from 'next/navigation';

import { getAppointmentDetailAction } from '@/actions/appointment';

import AppointmentEditPlaceClient from './AppointmentEditPlaceClient';

type AppointmentEditPlacePageProps = {
  params: {
    appointmentId: string;
  };
};

export default async function AppointmentEditPlacePage({
  params,
}: AppointmentEditPlacePageProps) {
  const result = await getAppointmentDetailAction(params.appointmentId);
  if (!result.ok || !result.data || !result.data.appointment.isOwner) {
    redirect(`/dashboard/appointments/${params.appointmentId}`);
  }

  return <AppointmentEditPlaceClient appointmentId={params.appointmentId} />;
}
