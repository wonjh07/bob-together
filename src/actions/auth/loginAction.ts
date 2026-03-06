'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { loginSchema } from '@/schemas/auth';

import type { LoginActionResult } from './_shared';

export async function loginAction(
  email: string,
  password: string,
): Promise<LoginActionResult> {
  const state = await runServiceAction({
    serverErrorMessage: '로그인 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = loginSchema.safeParse({ email, password });

      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
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

        return createActionErrorState({
          requestId,
          code: 'auth',
          message: isInvalidCreds
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : '로그인 중 오류가 발생했습니다.',
          error: {
            status: error.status,
            code: error.code,
            message: error.message,
            name: error.name,
          },
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
