'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  createPostgrestErrorState,
  createZodValidationErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type {
  AppointmentCommentItem,
  CreateAppointmentCommentResult,
} from '@/actions/appointment/types';

const createCommentSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  content: z
    .string()
    .trim()
    .min(1, '댓글을 입력해주세요.')
    .max(200, '댓글은 200자 이내로 입력해주세요.'),
});

interface AppointmentCommentRow {
  comment_id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    name: string | null;
    nickname: string | null;
    profile_image: string | null;
  } | null;
}

export async function createAppointmentCommentAction(params: {
  appointmentId: string;
  content: string;
}): Promise<CreateAppointmentCommentResult> {
  const state = await runServiceAction({
    serverErrorMessage: '댓글 작성 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = createCommentSchema.safeParse(params);
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
      const userId = user.id;
      const { appointmentId, content } = parsed.data;

      const { data: commentData, error: insertError } = await supabase
        .from('appointment_comments')
        .insert({
          appointment_id: appointmentId,
          user_id: userId,
          content,
        })
        .select(
          'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
        )
        .single();

      if (insertError) {
        return createPostgrestErrorState({
          requestId,
          error: insertError,
          permissionCodes: ['42501', '23503'],
          permissionMessage: '댓글 작성 권한이 없습니다.',
          serverMessage: '댓글 작성 중 오류가 발생했습니다.',
          extra: {
            appointmentId,
            userId,
          },
        });
      }

      if (!commentData) {
        return createActionErrorState({
          requestId,
          code: 'permission',
          message: '댓글 작성 권한이 없습니다.',
        });
      }

      const row = commentData as AppointmentCommentRow;
      const comment: AppointmentCommentItem = {
        commentId: row.comment_id,
        content: row.content,
        createdAt: row.created_at,
        userId: row.user_id,
        name: row.users?.name ?? null,
        nickname: row.users?.nickname ?? null,
        profileImage: row.users?.profile_image ?? null,
      };

      return createActionSuccessState({
        requestId,
        data: {
          appointmentId,
          commentId: comment.commentId,
          comment,
          commentCountDelta: 1 as const,
        },
      });
    },
  });

  return toActionResult(state);
}
