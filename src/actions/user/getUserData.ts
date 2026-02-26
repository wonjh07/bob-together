'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { GetUserDataResult, UserData } from './_shared';

export async function getUserData(): Promise<GetUserDataResult> {
  try {
    const auth = await requireUser();
    if (!auth.ok) {
      return auth;
    }
    const { supabase, user } = auth;

    const { data: userRow } = await supabase
      .from('users')
      .select('name,nickname,profile_image')
      .eq('user_id', user.id)
      .maybeSingle();

    // Source of truth: users table, fallback to auth metadata
    const profileImage =
      userRow?.profile_image ??
      user.user_metadata?.profileImage ??
      user.user_metadata?.avatar_url ??
      null;

    const userData: UserData = {
      id: user.id,
      email: user.email,
      name: userRow?.name ?? user.user_metadata?.name,
      nickname: userRow?.nickname ?? user.user_metadata?.nickname,
    };

    if (profileImage) {
      userData.profileImage = profileImage;
    }

    return actionSuccess(userData);
  } catch (err) {
    return actionError(
      'server-error',
      err instanceof Error ? err.message : '사용자 정보 불러오기 실패',
    );
  }
}
