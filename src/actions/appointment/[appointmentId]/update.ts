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

  const updateAppointmentRpc = 'update_appointment_transactional' as never;
  const updateAppointmentParams = {
    p_user_id: user.id,
    p_appointment_id: appointmentId,
    p_title: title,
    p_start_at: startAt.toISOString(),
    p_ends_at: endsAt.toISOString(),
    p_place_id: place.placeId ?? null,
    p_place_kakao_id: place.kakaoId ?? null,
    p_place_name: place.name,
    p_place_address: place.address,
    p_place_category: place.category ?? null,
    p_place_latitude: place.latitude,
    p_place_longitude: place.longitude,
  } as never;
  const { data, error } = await supabase.rpc(
    updateAppointmentRpc,
    updateAppointmentParams,
  );

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '약속 작성자만 수정할 수 있습니다.');
    }
    return actionError('server-error', '약속 수정에 실패했습니다.');
  }

  const row =
    (
      (data as {
        ok: boolean;
        error_code: string | null;
        appointment_id: string | null;
      }[] | null) ?? []
    )[0] ?? null;
  if (!row) {
    return actionError('server-error', '약속 수정에 실패했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'appointment-not-found':
        return actionError('appointment-not-found', '약속 정보를 찾을 수 없습니다.');
      case 'forbidden':
        return actionError('forbidden', '약속 작성자만 수정할 수 있습니다.');
      case 'missing-place':
        return actionError('missing-place', '장소 정보를 확인해주세요.');
      case 'invalid-format':
        return actionError('invalid-format', '약속 정보를 확인해주세요.');
      default:
        return actionError('server-error', '약속 수정에 실패했습니다.');
    }
  }

  return actionSuccess({ appointmentId });
}
