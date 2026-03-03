'use server';

import { actionError, actionSuccess } from '@/actions/_common/result';
import { createSupabaseAdminClient } from '@/libs/supabase/server';
import { emailFindSchema } from '@/schemas/auth';

import type { FindEmailActionResult } from './_shared';

function maskEmail(email: string): string | null {
  const [local = '', domain = ''] = email.split('@');

  if (!local || !domain) {
    return null;
  }

  if (local.length <= 2) {
    return `${local.slice(0, 1)}*@${domain}`;
  }

  return `${local.slice(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
}

export async function findEmailAction(
  name: string,
  nickname: string,
): Promise<FindEmailActionResult> {
  const parsed = emailFindSchema.safeParse({ name, nickname });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return actionError(
      'invalid-format',
      firstError?.message || '입력값이 올바르지 않습니다.',
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('name', parsed.data.name)
      .eq('nickname', parsed.data.nickname)
      .not('email', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      return actionError('server-error', '이메일 조회 중 오류가 발생했습니다.');
    }

    const email = data?.[0]?.email;
    const maskedEmail = email ? maskEmail(email) : null;

    if (!maskedEmail) {
      return actionError(
        'user-not-found',
        '입력한 이름과 닉네임에 해당하는 계정을 찾을 수 없습니다.',
      );
    }

    return actionSuccess({ maskedEmail });
  } catch {
    return actionError('server-error', '이메일 조회 중 오류가 발생했습니다.');
  }
}
