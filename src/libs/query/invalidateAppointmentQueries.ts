import { appointmentKeys } from './appointmentKeys';

import type { QueryClient } from '@tanstack/react-query';

export async function invalidateAppointmentListQueries(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({ queryKey: appointmentKeys.listRoot() });
}

export async function invalidateAppointmentSearchQueries(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({ queryKey: appointmentKeys.searchRoot() });
}

export async function invalidateMyReviewsQueries(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({ queryKey: appointmentKeys.myReviewsRoot() });
}

export async function invalidateMyCommentsQueries(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({ queryKey: appointmentKeys.myCommentsRoot() });
}

export async function invalidateAppointmentDetailQuery(
  queryClient: QueryClient,
  appointmentId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: appointmentKeys.detail(appointmentId),
  });
}

export async function invalidateAppointmentCommentsQuery(
  queryClient: QueryClient,
  appointmentId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: appointmentKeys.comments(appointmentId),
  });
}
