'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { createSupabaseAdminClient } from '@/libs/supabase/server';
import { resetPasswordIdentitySchema } from '@/schemas/auth';

import type { VerifyResetPasswordIdentityActionResult } from './_shared';

export async function verifyResetPasswordIdentityAction(
  email: string,
  name: string,
): Promise<VerifyResetPasswordIdentityActionResult> {
  const state = await runServiceAction({
    serverErrorMessage: '사용자 검증 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = resetPasswordIdentitySchema.safeParse({ email, name });
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.rpc('find_user_id_for_password_reset', {
        p_email: parsed.data.email,
        p_name: parsed.data.name,
      });

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '사용자 검증 중 오류가 발생했습니다.',
          error,
        });
      }

      if (!data?.[0]?.user_id) {
        return createActionErrorState({
          requestId,
          code: 'not_found',
          message: '입력한 정보와 일치하는 계정을 찾을 수 없습니다.',
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
