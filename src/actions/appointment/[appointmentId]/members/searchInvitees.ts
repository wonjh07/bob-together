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
import { groupSearchSchema } from '@/schemas/group';

import type {
  AppointmentInviteeSummary,
  SearchAppointmentInvitableUsersResult,
} from '@/actions/appointment/types';

const searchAppointmentInvitableUsersSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  query: groupSearchSchema,
});

interface InviteeCandidateRow {
  user_id: string;
  name: string | null;
  nickname: string | null;
  profile_image: string | null;
}

interface SearchAppointmentInviteesRpcRow {
  ok: boolean;
  error_code: string | null;
  users: unknown;
}

export async function searchAppointmentInvitableUsersAction(params: {
  appointmentId: string;
  query: string;
}): Promise<SearchAppointmentInvitableUsersResult> {
  const state = await runServiceAction({
    serverErrorMessage: '초대 대상 검색 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = searchAppointmentInvitableUsersSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const { appointmentId, query } = parsed.data;

      const searchInviteesRpc =
        'search_appointment_invitable_users_transactional' as never;
      const searchInviteesParams = {
        p_inviter_id: user.id,
        p_appointment_id: appointmentId,
        p_query: query,
        p_limit: 6,
        p_candidate_limit: 20,
      } as never;
      const { data, error } = await supabase.rpc(
        searchInviteesRpc,
        searchInviteesParams,
      );

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
          message: '초대 대상 검색 중 오류가 발생했습니다.',
          error,
        });
      }

      const row =
        ((data as SearchAppointmentInviteesRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 대상 검색 중 오류가 발생했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
            });
          case 'forbidden-not-member':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '약속 멤버만 초대할 수 있습니다.',
            });
          case 'forbidden-appointment-canceled':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '취소된 약속은 초대할 수 없습니다.',
            });
          case 'forbidden-appointment-ended':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '종료된 약속은 초대할 수 없습니다.',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '초대 대상 검색 중 오류가 발생했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      const users = (
        Array.isArray(row.users) ? (row.users as InviteeCandidateRow[]) : []
      )
        .filter((candidate) => Boolean(candidate?.user_id))
        .map(
          (candidate): AppointmentInviteeSummary => ({
            userId: candidate.user_id,
            name: candidate.name ?? null,
            nickname: candidate.nickname ?? null,
            profileImage: candidate.profile_image ?? null,
          }),
        );

      return createActionSuccessState({
        requestId,
        data: { users },
      });
    },
  });

  return toActionResult(state);
}
