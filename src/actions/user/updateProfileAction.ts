'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { nameSchema, nicknameSchema, passwordSchema } from '@/schemas/auth';

import type { UpdateProfileResult } from './_shared';

type UpdateProfileParams = {
  name: string;
  nickname: string;
  password?: string;
};

export async function updateProfileAction(
  params: UpdateProfileParams,
): Promise<UpdateProfileResult> {
  const state = await runServiceAction({
    serverErrorMessage: '프로필 저장에 실패했습니다.',
    run: async ({ requestId }) => {
      const parsedName = nameSchema.safeParse(params.name);
      if (!parsedName.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsedName.error,
          fallbackMessage: '이름 형식이 올바르지 않습니다.',
        });
      }

      const parsedNickname = nicknameSchema.safeParse(params.nickname);
      if (!parsedNickname.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsedNickname.error,
          fallbackMessage: '닉네임 형식이 올바르지 않습니다.',
        });
      }

      if (params.password) {
        const parsedPassword = passwordSchema.safeParse(params.password);
        if (!parsedPassword.success) {
          return createZodValidationErrorState({
            requestId,
            error: parsedPassword.error,
            fallbackMessage: '비밀번호 형식이 올바르지 않습니다.',
          });
        }
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;
      const userId = user.id;

      const { data: updatedUserRow, error: updateUserError } = await supabase
        .from('users')
        .update({
          name: parsedName.data,
          nickname: parsedNickname.data,
        })
        .eq('user_id', userId)
        .select('user_id')
        .maybeSingle();

      if (updateUserError || !updatedUserRow) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필 저장에 실패했습니다.',
          error: updateUserError
            ? {
                code: updateUserError.code,
                message: updateUserError.message,
                details: updateUserError.details,
                hint: updateUserError.hint,
              }
            : { message: 'missing-updated-user-row' },
        });
      }

      const authUpdatePayload: {
        data: Record<string, unknown>;
        password?: string;
      } = {
        data: {
          ...user.user_metadata,
          name: parsedName.data,
          nickname: parsedNickname.data,
        },
      };

      if (params.password) {
        authUpdatePayload.password = params.password;
      }

      const { error: authUpdateError } =
        await supabase.auth.updateUser(authUpdatePayload);

      if (authUpdateError) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필은 저장되었지만 계정 정보 동기화에 실패했습니다.',
          error: {
            code: authUpdateError.code,
            message: authUpdateError.message,
          },
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
