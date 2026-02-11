'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { appointmentCreateSchema } from '@/schemas/appointment';

import type { CreateAppointmentResult } from './_shared';
import type { AppointmentCreateInput } from '@/schemas/appointment';

export async function createAppointmentAction(
  params: AppointmentCreateInput,
): Promise<CreateAppointmentResult> {
  const parsed = appointmentCreateSchema.safeParse(params);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '입력값이 올바르지 않습니다.',
    };
  }

  const { title, date, startTime, endTime, place, groupId } = parsed.data;

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

  let resolvedGroupId = groupId;

  if (!resolvedGroupId) {
    const { data: groupData, error: groupError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userData.user.id)
      .order('joined_at', { ascending: false })
      .maybeSingle();

    if (groupError || !groupData) {
      return {
        ok: false,
        error: 'missing-group',
        message: '가입한 그룹이 없습니다.',
      };
    }

    resolvedGroupId = groupData.group_id;
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
    console.error('[createAppointmentAction] place upsert failed', {
      message: placeError?.message,
      code: placeError?.code,
      details: placeError?.details,
      hint: placeError?.hint,
      kakaoId: place.kakaoId,
      groupId: resolvedGroupId,
    });
    return {
      ok: false,
      error: 'missing-place',
      message: '장소 정보를 저장할 수 없습니다.',
    };
  }

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      title,
      creator_id: userData.user.id,
      group_id: resolvedGroupId,
      start_at: startAt.toISOString(),
      ends_at: endsAt.toISOString(),
      place_id: placeData.place_id,
      status: 'pending',
    })
    .select('appointment_id')
    .single();

  if (appointmentError || !appointmentData) {
    console.error('[createAppointmentAction] appointment insert failed', {
      message: appointmentError?.message,
      code: appointmentError?.code,
      details: appointmentError?.details,
      hint: appointmentError?.hint,
      groupId: resolvedGroupId,
      placeId: placeData?.place_id,
    });
    return {
      ok: false,
      error: 'server-error',
      message: '약속 생성 중 오류가 발생했습니다.',
    };
  }

  const { error: memberError } = await supabase.from('appointment_members').insert({
    appointment_id: appointmentData.appointment_id,
    user_id: userData.user.id,
    role: 'owner',
  });

  if (memberError) {
    console.error('[createAppointmentAction] appointment member insert failed', {
      message: memberError?.message,
      code: memberError?.code,
      details: memberError?.details,
      hint: memberError?.hint,
      appointmentId: appointmentData.appointment_id,
    });
    return {
      ok: false,
      error: 'server-error',
      message: '약속 멤버 등록 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: { appointmentId: appointmentData.appointment_id },
  };
}
