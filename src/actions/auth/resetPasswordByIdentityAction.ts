'use server';

import { actionError, actionSuccess } from '@/actions/_common/result';
import { createSupabaseAdminClient } from '@/libs/supabase/server';
import { resetPasswordSchema } from '@/schemas/auth';

import type { ResetPasswordByIdentityActionResult } from './_shared';
import type { ResetPasswordInput } from '@/schemas/auth';

export async function resetPasswordByIdentityAction(
  params: ResetPasswordInput,
): Promise<ResetPasswordByIdentityActionResult> {
  const parsed = resetPasswordSchema.safeParse(params);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return actionError(
      'invalid-format',
      firstError?.message || '입력값이 올바르지 않습니다.',
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: userRows, error: findError } = await supabase.rpc(
      'find_user_id_for_password_reset',
      {
        p_email: parsed.data.email,
        p_name: parsed.data.name,
      },
    );

    if (findError) {
      return actionError('server-error', '계정 조회 중 오류가 발생했습니다.');
    }

    const userId = userRows?.[0]?.user_id;
    if (!userId) {
      return actionError(
        'user-not-found',
        '입력한 정보와 일치하는 계정을 찾을 수 없습니다.',
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: parsed.data.newPassword,
      },
    );

    if (updateError) {
      return actionError(
        'server-error',
        '비밀번호 재설정 중 오류가 발생했습니다.',
      );
    }

    return actionSuccess();
  } catch {
    return actionError('server-error', '비밀번호 재설정 중 오류가 발생했습니다.');
  }
}
