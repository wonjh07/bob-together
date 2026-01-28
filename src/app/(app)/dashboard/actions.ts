'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export interface UserData {
  id?: string;
  email?: string;
  name?: string;
  nickname?: string;
}

export async function getUserData(): Promise<{
  user: UserData | null;
  error: string | null;
}> {
  const supabase = createSupabaseServerClient();

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return {
        user: null,
        error: error?.message || '사용자 정보를 불러올 수 없습니다.',
      };
    }

    // user_metadata에서 name, nickname 추출
    const user: UserData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      nickname: data.user.user_metadata?.nickname,
    };

    return { user, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : '사용자 정보 불러오기 실패';
    return {
      user: null,
      error: errorMessage,
    };
  }
}
