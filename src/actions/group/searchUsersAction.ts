'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupSearchSchema } from '@/schemas/group';

import { mapUser, type SearchUsersResult } from './_shared';

export async function searchUsersAction(
  query: string,
): Promise<SearchUsersResult> {
  const parsed = groupSearchSchema.safeParse(query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '검색어를 입력해주세요.',
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

  const normalizedQuery = parsed.data;

  const { data, error } = await supabase
    .from('users')
    .select('user_id, name, nickname')
    .or(`nickname.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%`)
    .neq('user_id', userData.user.id)
    .limit(6);

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '사용자 검색 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: {
      users: (data || []).map(mapUser),
    },
  };
}
