'use server';

import { actionError, actionSuccess } from '@/actions/_common/result';
import { createSupabaseAdminClient } from '@/libs/supabase/server';
import { resetPasswordIdentitySchema } from '@/schemas/auth';

import type { VerifyResetPasswordIdentityActionResult } from './_shared';

export async function verifyResetPasswordIdentityAction(
  email: string,
  name: string,
): Promise<VerifyResetPasswordIdentityActionResult> {
  const parsed = resetPasswordIdentitySchema.safeParse({ email, name });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return actionError(
      'invalid-format',
      firstError?.message || '입력값이 올바르지 않습니다.',
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc(
      'find_user_id_for_password_reset',
      {
        p_email: parsed.data.email,
        p_name: parsed.data.name,
      },
    );

    if (error) {
      return actionError('server-error', '사용자 검증 중 오류가 발생했습니다.');
    }

    if (!data?.[0]?.user_id) {
      return actionError(
        'user-not-found',
        '입력한 정보와 일치하는 계정을 찾을 수 없습니다.',
      );
    }

    return actionSuccess();
  } catch {
    return actionError('server-error', '사용자 검증 중 오류가 발생했습니다.');
  }
}
