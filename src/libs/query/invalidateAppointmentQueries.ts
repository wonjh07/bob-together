import { appointmentKeys } from './appointmentKeys';
import { placeKeys } from './placeKeys';

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

export async function invalidateReviewableAppointmentsQueries(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({
    queryKey: appointmentKeys.reviewableRoot(),
  });
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

export async function invalidateAppointmentCollectionQueries(
  queryClient: QueryClient,
) {
  await Promise.all([
    invalidateAppointmentListQueries(queryClient),
    invalidateAppointmentSearchQueries(queryClient),
  ]);
}

export async function invalidateAppointmentDetailAndCollectionQueries(
  queryClient: QueryClient,
  appointmentId: string,
) {
  await Promise.all([
    invalidateAppointmentDetailQuery(queryClient, appointmentId),
    invalidateAppointmentCollectionQueries(queryClient),
  ]);
}

export async function invalidateReviewMutationQueries(
  queryClient: QueryClient,
  params: {
    appointmentId: string;
    placeId: string;
  },
) {
  const { appointmentId, placeId } = params;

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: appointmentKeys.historyRoot(),
    }),
    queryClient.invalidateQueries({
      queryKey: appointmentKeys.reviewTarget(appointmentId),
    }),
    invalidateAppointmentDetailAndCollectionQueries(queryClient, appointmentId),
    invalidateMyReviewsQueries(queryClient),
    invalidateReviewableAppointmentsQueries(queryClient),
    queryClient.invalidateQueries({
      queryKey: placeKeys.detail(placeId),
    }),
    queryClient.invalidateQueries({
      queryKey: placeKeys.reviews(placeId),
    }),
  ]);
}

export async function invalidateMyCommentMutationQueries(
  queryClient: QueryClient,
  appointmentId: string,
) {
  await Promise.all([
    invalidateMyCommentsQueries(queryClient),
    invalidateAppointmentDetailQuery(queryClient, appointmentId),
    invalidateAppointmentCommentsQuery(queryClient, appointmentId),
    invalidateAppointmentCollectionQueries(queryClient),
    queryClient.invalidateQueries({
      queryKey: appointmentKeys.historyRoot(),
    }),
  ]);
}
