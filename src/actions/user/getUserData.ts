'use server';

import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import type { GetUserDataResult, UserData } from './_shared';

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

    const { data: userRow } = await supabase
      .from('users')
      .select('name,nickname,profile_image')
      .eq('user_id', data.user.id)
      .maybeSingle();

    // Source of truth: users table, fallback to auth metadata
    const profileImage =
      userRow?.profile_image ??
      data.user.user_metadata?.profileImage ??
      data.user.user_metadata?.avatar_url ??
      null;

    const user: UserData = {
      id: data.user.id,
      email: data.user.email,
      name: userRow?.name ?? data.user.user_metadata?.name,
      nickname: userRow?.nickname ?? data.user.user_metadata?.nickname,
    };

    if (profileImage) {
      user.profileImage = profileImage;
    }

    return { ok: true, data: user };
  } catch (err) {
    return {
      ok: false,
      error: 'server-error',
      message: err instanceof Error ? err.message : '사용자 정보 불러오기 실패',
    };
  }
}
