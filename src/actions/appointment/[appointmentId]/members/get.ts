'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';

import type {
  AppointmentMemberItem,
  GetAppointmentMembersResult,
} from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface AppointmentMemberRow {
  user_id: string;
  role: 'owner' | 'member';
  name: string | null;
  nickname: string | null;
  profile_image: string | null;
}

interface GetAppointmentMembersRpcRow {
  ok: boolean;
  error_code: string | null;
  member_count: number | null;
  members: unknown;
}

function mapRpcMembers(members: unknown): AppointmentMemberItem[] {
  if (!Array.isArray(members)) {
    return [];
  }

  return members.flatMap((member) => {
    if (!member || typeof member !== 'object') {
      return [];
    }

    const row = member as AppointmentMemberRow;
    if (
      typeof row.user_id !== 'string'
      || (row.role !== 'owner' && row.role !== 'member')
    ) {
      return [];
    }

    return [{
      userId: row.user_id,
      role: row.role,
      name: typeof row.name === 'string' ? row.name : null,
      nickname: typeof row.nickname === 'string' ? row.nickname : null,
      profileImage:
        typeof row.profile_image === 'string'
          ? row.profile_image
          : null,
    }];
  });
}

export async function getAppointmentMembersAction(
  appointmentId: string,
): Promise<GetAppointmentMembersResult> {
  const state = await runServiceAction({
    serverErrorMessage: '약속 멤버를 불러올 수 없습니다.',
    run: async ({ requestId }) => {
      const parsed = appointmentIdSchema.safeParse(appointmentId);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '유효한 약속 ID가 아닙니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const getMembersRpc = 'get_appointment_members_with_count' as never;
      const getMembersParams = {
        p_user_id: user.id,
        p_appointment_id: parsed.data,
      } as never;
      const { data, error } = await supabase.rpc(getMembersRpc, getMembersParams);

      if (error) {
        if (error.code === '42501') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
            error,
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 멤버를 불러올 수 없습니다.',
          error,
        });
      }

      const row = ((data as GetAppointmentMembersRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 멤버를 불러올 수 없습니다.',
        });
      }

      if (!row.ok) {
        if (row.error_code === 'forbidden') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 멤버를 불러올 수 없습니다.',
          error: { rpcErrorCode: row.error_code },
        });
      }

      const members = mapRpcMembers(row.members);
      const memberCount =
        typeof row.member_count === 'number' ? row.member_count : members.length;

      return createActionSuccessState({
        requestId,
        data: {
          memberCount,
          members,
          currentUserId: user.id,
        },
      });
    },
  });

  return toActionResult(state);
}
