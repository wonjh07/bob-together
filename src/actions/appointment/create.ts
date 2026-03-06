'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { appointmentCreateSchema } from '@/schemas/appointment';

import type { CreateAppointmentResult } from './types';
import type { AppointmentCreateInput } from '@/schemas/appointment';

interface CreateAppointmentRpcRow {
  appointment_id: string;
  place_id: string;
}

export async function createAppointmentAction(
  params: AppointmentCreateInput,
): Promise<CreateAppointmentResult> {
  const state = await runServiceAction({
    serverErrorMessage: '약속 생성 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = appointmentCreateSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const { title, date, startTime, endTime, place, groupId } = parsed.data;

      const startAt = new Date(`${date}T${startTime}:00`);
      const endsAt = new Date(`${date}T${endTime}:00`);

      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endsAt.getTime())) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '약속 날짜/시간을 확인해주세요.',
        });
      }

      if (endsAt <= startAt) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '종료 시간이 시작 시간보다 늦어야 합니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const resolvedGroupId = groupId ?? null;

      const createAppointmentRpc = 'create_appointment_with_owner_member' as never;
      const createAppointmentParams = {
        p_user_id: user.id,
        p_group_id: resolvedGroupId,
        p_title: title,
        p_start_at: startAt.toISOString(),
        p_ends_at: endsAt.toISOString(),
        p_place_kakao_id: place.kakaoId,
        p_place_name: place.name,
        p_place_address: place.address,
        p_place_category: place.category || '',
        p_place_latitude: place.latitude,
        p_place_longitude: place.longitude,
      } as never;
      const { data, error } = await supabase.rpc(
        createAppointmentRpc,
        createAppointmentParams,
      );

      const row = ((data as CreateAppointmentRpcRow[] | null) ?? [])[0] ?? null;
      if (error || !row) {
        if (error?.code === '42501') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '약속 생성 권한이 없습니다.',
            error,
          });
        }
        if (error?.code === 'P0001') {
          return createActionErrorState({
            requestId,
            code: 'validation',
            message: '가입한 그룹이 없습니다.',
            error,
          });
        }

        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 생성 중 오류가 발생했습니다.',
          error: {
            code: error?.code,
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            userId: user.id,
            groupId: resolvedGroupId,
            placeKakaoId: place.kakaoId,
          },
        });
      }

      return createActionSuccessState({
        requestId,
        data: { appointmentId: row.appointment_id },
      });
    },
  });

  return toActionResult(state);
}
