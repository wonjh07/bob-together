'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { signupSchema } from '@/schemas/auth';

import type { SignupActionResult, SignupParams } from './_shared';

export async function signupAction(
  params: SignupParams,
): Promise<SignupActionResult> {
  const { email, password, name, nickname } = params;

  const parsed = signupSchema.safeParse({
    email,
    password,
    passwordConfirm: password,
    name,
    nickname,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '입력값이 올바르지 않습니다.',
    };
  }

  const validatedData = parsed.data;
  const supabase = createSupabaseServerClient();

  try {
    const { data: _data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          nickname: validatedData.nickname,
        },
      },
    });

    if (error) {
      return {
        ok: false,
        error: 'signup-failed',
        message: error.message,
      };
    }
  } catch (err) {
    return {
      ok: false,
      error: 'server-error',
      message:
        err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.',
    };
  }

  return { ok: true };
}
