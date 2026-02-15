'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import {
  appointmentDateSchema,
  appointmentTimeSchema,
  appointmentTitleSchema,
} from '@/schemas/appointment';

import type { UpdateAppointmentResult } from '../types';

const updateAppointmentSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  title: appointmentTitleSchema,
  date: appointmentDateSchema,
  startTime: appointmentTimeSchema,
  endTime: appointmentTimeSchema,
  place: z.object({
    placeId: z.string().uuid().nullable().optional(),
    kakaoId: z.string().nullable().optional(),
    name: z.string().trim().min(1),
    address: z.string().trim().min(1),
    category: z.string().nullable().optional(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export async function updateAppointmentAction(params: {
  appointmentId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  place: {
    placeId?: string | null;
    kakaoId?: string | null;
    name: string;
    address: string;
    category?: string | null;
    latitude: number;
    longitude: number;
  };
}): Promise<UpdateAppointmentResult> {
  const parsed = parseOrFail(updateAppointmentSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const { appointmentId, title, date, startTime, endTime, place } = parsed.data;
  const startAt = new Date(`${date}T${startTime}:00`);
  const endsAt = new Date(`${date}T${endTime}:00`);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return actionError('invalid-format', '약속 날짜/시간을 확인해주세요.');
  }

  if (endsAt <= startAt) {
    return actionError('invalid-time', '종료 시간이 시작 시간보다 늦어야 합니다.');
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('creator_id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
  }

  if (appointmentData.creator_id !== user.id) {
    return actionError('forbidden', '약속 작성자만 수정할 수 있습니다.');
  }

  let resolvedPlaceId = place.placeId ?? null;

  if (!resolvedPlaceId) {
    if (!place.kakaoId) {
      return actionError('missing-place', '장소 정보를 확인해주세요.');
    }

    const { data: placeData, error: placeError } = await supabase
      .from('places')
      .upsert(
        {
          kakao_id: place.kakaoId,
          name: place.name,
          address: place.address,
          category: place.category || '',
          latitude: place.latitude,
          longitude: place.longitude,
        },
        { onConflict: 'kakao_id' },
      )
      .select('place_id')
      .single();

    if (placeError || !placeData) {
      return actionError('missing-place', '장소 정보를 저장할 수 없습니다.');
    }

    resolvedPlaceId = placeData.place_id;
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      title,
      start_at: startAt.toISOString(),
      ends_at: endsAt.toISOString(),
      place_id: resolvedPlaceId,
    })
    .eq('appointment_id', appointmentId);

  if (updateError) {
    return actionError('server-error', '약속 수정에 실패했습니다.');
  }

  return actionSuccess({ appointmentId });
}
