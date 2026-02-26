'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { groupSearchSchema } from '@/schemas/group';

import { mapUser, type SearchGroupInvitableUsersResult } from './_shared';

interface UserRow {
  user_id: string;
  name: string | null;
  nickname: string | null;
}

interface SearchGroupInvitableUsersRpcRow {
  ok: boolean;
  error_code: string | null;
  users: unknown;
  pending_invitee_ids: string[] | null;
}

export async function searchGroupInvitableUsersAction(
  groupId: string,
  query: string,
): Promise<SearchGroupInvitableUsersResult> {
  if (!groupId) {
    return actionError('invalid-format', '그룹 정보가 필요합니다.');
  }

  const parsed = groupSearchSchema.safeParse(query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return actionError('invalid-format', firstError?.message || '검색어를 입력해주세요.');
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const searchGroupInviteesRpc =
    'search_group_invitable_users_transactional' as never;
  const searchGroupInviteesParams = {
    p_inviter_id: user.id,
    p_group_id: groupId,
    p_query: parsed.data,
    p_limit: 6,
    p_candidate_limit: 20,
  } as never;
  const { data, error } = await supabase.rpc(
    searchGroupInviteesRpc,
    searchGroupInviteesParams,
  );

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '그룹을 찾을 수 없거나 접근 권한이 없습니다.');
    }
    return actionError('server-error', '사용자 검색 중 오류가 발생했습니다.');
  }

  const row =
    ((data as SearchGroupInvitableUsersRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '사용자 검색 중 오류가 발생했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'forbidden':
        return actionError('forbidden', '그룹을 찾을 수 없거나 접근 권한이 없습니다.');
      case 'invalid-format':
        return actionError('invalid-format', '검색어를 입력해주세요.');
      default:
        return actionError('server-error', '사용자 검색 중 오류가 발생했습니다.');
    }
  }

  const candidateRows = Array.isArray(row.users)
    ? (row.users as UserRow[])
    : [];
  const users = candidateRows
    .filter((candidate) => Boolean(candidate?.user_id))
    .map(mapUser);
  const pendingInviteeIds = Array.isArray(row.pending_invitee_ids)
    ? row.pending_invitee_ids.filter((id): id is string => typeof id === 'string')
    : [];

  return actionSuccess({ users, pendingInviteeIds });
}
