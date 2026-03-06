'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { createSupabaseAdminClient } from '@/libs/supabase/server';
import { emailFindSchema } from '@/schemas/auth';

import type { FindEmailActionResult } from './_shared';

export async function findEmailAction(
  name: string,
  nickname: string,
): Promise<FindEmailActionResult> {
  const request = runServiceAction({
    serverErrorMessage: '이메일 조회 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = emailFindSchema.safeParse({ name, nickname });
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.rpc('find_masked_email_by_identity', {
        p_name: parsed.data.name,
        p_nickname: parsed.data.nickname,
      });

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '이메일 조회 중 오류가 발생했습니다.',
          error,
        });
      }

      const maskedEmail = data?.[0]?.masked_email ?? null;
      if (!maskedEmail) {
        return createActionErrorState({
          requestId,
          code: 'not_found',
          message: '입력한 이름과 닉네임에 해당하는 계정을 찾을 수 없습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: { maskedEmail },
      });
    },
  });

  const state = await request;
  return toActionResult(state);
}
