'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { ActionResult, AuthErrorCode } from '@/types/result';

// ============================================================================
// User Data
// ============================================================================

export interface UserData {
  id?: string;
  email?: string;
  name?: string;
  nickname?: string;
}

export type GetUserDataResult = ActionResult<UserData, AuthErrorCode>;

export async function getUserData(): Promise<GetUserDataResult> {
  const supabase = createSupabaseServerClient();

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return {
        ok: false,
        error: 'user-not-found',
        message: error?.message || '사용자 정보를 불러올 수 없습니다.',
      };
    }

    // Extract name, nickname from user_metadata
    const user: UserData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      nickname: data.user.user_metadata?.nickname,
    };

    return { ok: true, data: user };
  } catch (err) {
    return {
      ok: false,
      error: 'server-error',
      message: err instanceof Error ? err.message : '사용자 정보 불러오기 실패',
    };
  }
}
