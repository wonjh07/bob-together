'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
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
  const parsedName = nameSchema.safeParse(params.name);
  if (!parsedName.success) {
    return actionError(
      'invalid-format',
      parsedName.error.issues[0]?.message || '이름 형식이 올바르지 않습니다.',
    );
  }

  const parsedNickname = nicknameSchema.safeParse(params.nickname);
  if (!parsedNickname.success) {
    return actionError(
      'invalid-format',
      parsedNickname.error.issues[0]?.message || '닉네임 형식이 올바르지 않습니다.',
    );
  }

  if (params.password) {
    const parsedPassword = passwordSchema.safeParse(params.password);
    if (!parsedPassword.success) {
      return actionError(
        'invalid-format',
        parsedPassword.error.issues[0]?.message ||
          '비밀번호 형식이 올바르지 않습니다.',
      );
    }
  }

  const auth = await requireUser();
  if (!auth.ok) {
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
    return actionError('update-failed', '프로필 저장에 실패했습니다.');
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
    return actionError(
      'metadata-sync-failed',
      '프로필은 저장되었지만 계정 정보 동기화에 실패했습니다.',
    );
  }

  return actionSuccess();
}
