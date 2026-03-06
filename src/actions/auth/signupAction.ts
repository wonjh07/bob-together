'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { signupSchema } from '@/schemas/auth';

import type { SignupActionResult, SignupParams } from './_shared';

export async function signupAction(
  params: SignupParams,
): Promise<SignupActionResult> {
  const state = await runServiceAction({
    serverErrorMessage: '회원가입 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const { email, password, name, nickname } = params;

      const parsed = signupSchema.safeParse({
        email,
        password,
        passwordConfirm: password,
        name,
        nickname,
      });

      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
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
          return createActionErrorState({
            requestId,
            code: 'server',
            message: error.message || '회원가입에 실패했습니다.',
            error: {
              status: error.status,
              code: error.code,
              message: error.message,
              name: error.name,
            },
          });
        }
      } catch (err) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.',
          error: err,
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
