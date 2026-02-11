'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  appointmentDateSchema,
  appointmentTimeSchema,
  appointmentTitleSchema,
} from '@/schemas/appointment';

import type { UpdateAppointmentResult } from './_shared';

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
  const parsed = updateAppointmentSchema.safeParse(params);

  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid-format',
      message: parsed.error.issues[0]?.message || '요청 형식이 올바르지 않습니다.',
    };
  }

  const { appointmentId, title, date, startTime, endTime, place } = parsed.data;
  const startAt = new Date(`${date}T${startTime}:00`);
  const endsAt = new Date(`${date}T${endTime}:00`);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '약속 날짜/시간을 확인해주세요.',
    };
  }

  if (endsAt <= startAt) {
    return {
      ok: false,
      error: 'invalid-time',
      message: '종료 시간이 시작 시간보다 늦어야 합니다.',
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('creator_id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 정보를 찾을 수 없습니다.',
    };
  }

  if (appointmentData.creator_id !== userData.user.id) {
    return {
      ok: false,
      error: 'forbidden',
      message: '약속 작성자만 수정할 수 있습니다.',
    };
  }

  let resolvedPlaceId = place.placeId ?? null;

  if (!resolvedPlaceId) {
    if (!place.kakaoId) {
      return {
        ok: false,
        error: 'missing-place',
        message: '장소 정보를 확인해주세요.',
      };
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
      return {
        ok: false,
        error: 'missing-place',
        message: '장소 정보를 저장할 수 없습니다.',
      };
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
    return {
      ok: false,
      error: 'server-error',
      message: '약속 수정에 실패했습니다.',
    };
  }

  return {
    ok: true,
    data: { appointmentId },
  };
}
