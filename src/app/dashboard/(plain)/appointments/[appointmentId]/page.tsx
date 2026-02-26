import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import {
  createAppointmentDetailQueryOptions,
} from '@/libs/query/appointmentQueries';
import { getServerQueryScope } from '@/libs/query/getServerQueryScope';

import AppointmentDetailClient from './AppointmentDetailClient';

type AppointmentDetailPageProps = {
  params: {
    appointmentId: string;
  };
};

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  const appointmentId = params.appointmentId;
  const queryClient = new QueryClient();
  const queryScope = await getServerQueryScope();

  await queryClient.prefetchQuery(
    createAppointmentDetailQueryOptions(appointmentId, queryScope),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppointmentDetailClient appointmentId={appointmentId} />
    </HydrationBoundary>
  );
}
