'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { createSupabaseAdminClient } from '@/libs/supabase/server';
import { resetPasswordSchema } from '@/schemas/auth';

import type { ResetPasswordByIdentityActionResult } from './_shared';
import type { ResetPasswordInput } from '@/schemas/auth';

export async function resetPasswordByIdentityAction(
  params: ResetPasswordInput,
): Promise<ResetPasswordByIdentityActionResult> {
  const state = await runServiceAction({
    serverErrorMessage: '비밀번호 재설정 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = resetPasswordSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const supabase = createSupabaseAdminClient();
      const { data: userRows, error: findError } = await supabase.rpc(
        'find_user_id_for_password_reset',
        {
          p_email: parsed.data.email,
          p_name: parsed.data.name,
        },
      );

      if (findError) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '계정 조회 중 오류가 발생했습니다.',
          error: {
            code: findError.code,
            message: findError.message,
            details: findError.details,
            hint: findError.hint,
          },
        });
      }

      const userId = userRows?.[0]?.user_id;
      if (!userId) {
        return createActionErrorState({
          requestId,
          code: 'not_found',
          message: '입력한 정보와 일치하는 계정을 찾을 수 없습니다.',
        });
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: parsed.data.newPassword,
        },
      );

      if (updateError) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '비밀번호 재설정 중 오류가 발생했습니다.',
          error: {
            code: updateError.code,
            message: updateError.message,
          },
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
