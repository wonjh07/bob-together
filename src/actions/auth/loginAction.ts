'use server';

import { actionError, actionSuccess } from '@/actions/_common/result';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { loginSchema } from '@/schemas/auth';

import type { LoginActionResult } from './_shared';

export async function loginAction(
  email: string,
  password: string,
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return actionError(
      'invalid-email',
      firstError?.message || '입력값이 올바르지 않습니다.',
    );
  }

  const { email: validatedEmail, password: validatedPassword } = parsed.data;

  const supabase = createSupabaseServerClient();

  const { data: _data, error } = await supabase.auth.signInWithPassword({
    email: validatedEmail,
    password: validatedPassword,
  });

  if (error) {
    const isInvalidCreds =
      error.message?.toLowerCase().includes('invalid login credentials') ||
      error.message?.toLowerCase().includes('invalid credentials') ||
      error.status === 400;
    return actionError(
      isInvalidCreds ? 'invalid-credentials' : 'login-failed',
      isInvalidCreds
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : '로그인 중 오류가 발생했습니다.',
    );
  }

  return actionSuccess();
}
