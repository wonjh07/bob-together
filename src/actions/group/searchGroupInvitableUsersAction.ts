'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupSearchSchema } from '@/schemas/group';

import { mapUser, type SearchGroupInvitableUsersResult } from './_shared';

interface UserRow {
  user_id: string;
  name: string | null;
  nickname: string | null;
}

interface GroupMemberRow {
  user_id: string;
}

interface PendingInvitationRow {
  invitee_id: string;
}

export async function searchGroupInvitableUsersAction(
  groupId: string,
  query: string,
): Promise<SearchGroupInvitableUsersResult> {
  if (!groupId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
    };
  }

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

  const inviterId = userData.user.id;
  const normalizedQuery = parsed.data;

  const { data: inviterMembership, error: inviterMembershipError } =
    await supabase
      .from('group_members')
      .select('group_id')
      .eq('group_id', groupId)
      .eq('user_id', inviterId)
      .maybeSingle();

  if (inviterMembershipError || !inviterMembership) {
    return {
      ok: false,
      error: 'forbidden',
      message: '그룹을 찾을 수 없거나 접근 권한이 없습니다.',
    };
  }

  const [
    { data: candidates, error: candidatesError },
    { data: existingMembers, error: existingMembersError },
    { data: pendingInvites, error: pendingInvitesError },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('user_id, name, nickname')
      .or(`nickname.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%`)
      .neq('user_id', inviterId)
      .limit(20),
    supabase.from('group_members').select('user_id').eq('group_id', groupId),
    supabase
      .from('invitations')
      .select('invitee_id')
      .eq('group_id', groupId)
      .eq('type', 'group')
      .eq('status', 'pending'),
  ]);

  if (candidatesError || existingMembersError || pendingInvitesError) {
    return {
      ok: false,
      error: 'server-error',
      message: '사용자 검색 중 오류가 발생했습니다.',
    };
  }

  const existingMemberIds = new Set(
    ((existingMembers as GroupMemberRow[] | null) ?? []).map(
      (row) => row.user_id,
    ),
  );
  const pendingInviteeIds = new Set(
    ((pendingInvites as PendingInvitationRow[] | null) ?? []).map(
      (row) => row.invitee_id,
    ),
  );

  const users = ((candidates as UserRow[] | null) ?? [])
    .filter(
      (row) =>
        row.user_id &&
        !existingMemberIds.has(row.user_id),
    )
    .slice(0, 6)
    .map(mapUser);

  const pendingInviteeIdsInResult = users
    .map((user) => user.userId)
    .filter((userId) => pendingInviteeIds.has(userId));

  return {
    ok: true,
    data: { users, pendingInviteeIds: pendingInviteeIdsInResult },
  };
}
