'use server';

import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';
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
    return {
      ok: false,
      error: 'invalid-format',
      message: parsedName.error.issues[0]?.message || '이름 형식이 올바르지 않습니다.',
    };
  }

  const parsedNickname = nicknameSchema.safeParse(params.nickname);
  if (!parsedNickname.success) {
    return {
      ok: false,
      error: 'invalid-format',
      message:
        parsedNickname.error.issues[0]?.message || '닉네임 형식이 올바르지 않습니다.',
    };
  }

  if (params.password) {
    const parsedPassword = passwordSchema.safeParse(params.password);
    if (!parsedPassword.success) {
      return {
        ok: false,
        error: 'invalid-format',
        message:
          parsedPassword.error.issues[0]?.message ||
          '비밀번호 형식이 올바르지 않습니다.',
      };
    }
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false,
      error: 'user-not-found',
      message: '로그인 정보를 확인할 수 없습니다.',
    };
  }

  const userId = data.user.id;

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
    return {
      ok: false,
      error: 'update-failed',
      message: '프로필 저장에 실패했습니다.',
    };
  }

  const authUpdatePayload: {
    data: Record<string, unknown>;
    password?: string;
  } = {
    data: {
      ...data.user.user_metadata,
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
    return {
      ok: false,
      error: 'update-failed',
      message: '계정 정보 업데이트에 실패했습니다.',
    };
  }

  return { ok: true };
}
