'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { groupSearchSchema } from '@/schemas/group';

import { mapUser, type SearchUsersResult } from './_shared';

export async function searchUsersAction(
  query: string,
): Promise<SearchUsersResult> {
  const parsed = groupSearchSchema.safeParse(query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return actionError(
      'invalid-format',
      firstError?.message || '검색어를 입력해주세요.',
    );
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const normalizedQuery = parsed.data;

  const { data, error } = await supabase
    .from('users')
    .select('user_id, name, nickname')
    .or(`nickname.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%`)
    .neq('user_id', user.id)
    .limit(6);

  if (error) {
    return actionError('server-error', '사용자 검색 중 오류가 발생했습니다.');
  }

  return actionSuccess({
    users: (data || []).map(mapUser),
  });
}
