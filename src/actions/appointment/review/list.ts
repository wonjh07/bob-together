'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  ListReviewableAppointmentsResult,
  ReviewableAppointmentItem,
} from '../types';

interface AppointmentJoinedRow {
  appointment_id: string;
  appointments: {
    appointment_id: string;
    title: string;
    start_at: string;
    ends_at: string;
    place_id: string;
    places: {
      name: string;
    } | null;
  } | null;
}

interface PlaceReviewRow {
  place_id: string;
  score: number | null;
}

export async function listReviewableAppointmentsAction(): Promise<ListReviewableAppointmentsResult> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('appointment_members')
    .select(
      `
      appointment_id,
      appointments!inner(
        appointment_id,
        title,
        start_at,
        ends_at,
        status,
        place_id,
        places!inner(name)
      )
      `,
    )
    .eq('user_id', user.id)
    .neq('appointments.status', 'canceled')
    .lte('appointments.ends_at', nowIso);

  if (error) {
    return actionError('server-error', '리뷰 가능한 약속 목록을 불러오지 못했습니다.');
  }

  const rows = (data as AppointmentJoinedRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({ appointments: [] });
  }

  const uniqueByAppointment = new Map<string, ReviewableAppointmentItem>();
  for (const row of rows) {
    const appointment = row.appointments;
    if (!appointment) continue;

    uniqueByAppointment.set(appointment.appointment_id, {
      appointmentId: appointment.appointment_id,
      title: appointment.title,
      startAt: appointment.start_at,
      endsAt: appointment.ends_at,
      placeId: appointment.place_id,
      placeName: appointment.places?.name || '장소 미정',
      reviewAverage: null,
      reviewCount: 0,
    });
  }

  const appointments = Array.from(uniqueByAppointment.values());
  if (appointments.length === 0) {
    return actionSuccess({ appointments: [] });
  }

  const placeIds = appointments.map((item) => item.placeId);
  const { data: placeReviewData } = await supabase
    .from('user_places')
    .select('place_id, score')
    .in('place_id', placeIds)
    .not('score', 'is', null);

  const reviewRows = (placeReviewData as PlaceReviewRow[] | null) ?? [];
  const reviewStatsByPlace = new Map<string, { sum: number; count: number }>();

  for (const row of reviewRows) {
    if (typeof row.score !== 'number') continue;

    const previous = reviewStatsByPlace.get(row.place_id) ?? { sum: 0, count: 0 };
    reviewStatsByPlace.set(row.place_id, {
      sum: previous.sum + row.score,
      count: previous.count + 1,
    });
  }

  const mapped = appointments
    .map((appointment) => {
      const stats = reviewStatsByPlace.get(appointment.placeId);
      if (!stats || stats.count === 0) {
        return appointment;
      }

      return {
        ...appointment,
        reviewAverage: Number((stats.sum / stats.count).toFixed(1)),
        reviewCount: stats.count,
      };
    })
    .sort(
      (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
    );

  return actionSuccess({ appointments: mapped });
}
