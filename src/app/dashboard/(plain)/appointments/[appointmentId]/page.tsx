import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import {
  createAppointmentCommentsQueryOptions,
  createAppointmentDetailQueryOptions,
} from '@/libs/query/appointmentQueries';

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

  await Promise.allSettled([
    queryClient.prefetchQuery(createAppointmentDetailQueryOptions(appointmentId)),
    queryClient.prefetchQuery(createAppointmentCommentsQueryOptions(appointmentId)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppointmentDetailClient appointmentId={appointmentId} />
    </HydrationBoundary>
  );
}
