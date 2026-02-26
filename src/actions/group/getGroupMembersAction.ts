'use server';

import { z } from 'zod';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  GetGroupMembersResult,
  GroupMemberItem,
} from './_shared';

interface GroupMemberRow {
  user_id: string;
  role: 'owner' | 'member';
  name: string | null;
  nickname: string | null;
  profile_image: string | null;
}

interface GetGroupMembersRpcRow {
  ok: boolean;
  error_code: string | null;
  member_count: number | null;
  members: unknown;
}

function mapRpcMembers(members: unknown): GroupMemberItem[] {
  if (!Array.isArray(members)) {
    return [];
  }

  return members.flatMap((member) => {
    if (!member || typeof member !== 'object') {
      return [];
    }

    const row = member as GroupMemberRow;
    if (
      typeof row.user_id !== 'string'
      || (row.role !== 'owner' && row.role !== 'member')
    ) {
      return [];
    }

    return [{
      userId: row.user_id,
      role: row.role,
      name: typeof row.name === 'string' ? row.name : null,
      nickname: typeof row.nickname === 'string' ? row.nickname : null,
      profileImage:
        typeof row.profile_image === 'string'
          ? row.profile_image
          : null,
    }];
  });
}

export async function getGroupMembersAction(
  groupId: string,
): Promise<GetGroupMembersResult> {
  if (!groupId) {
    return actionError('invalid-format', '그룹 정보가 필요합니다.');
  }
  if (!z.string().uuid().safeParse(groupId).success) {
    return actionError('invalid-format', '유효한 그룹 ID가 아닙니다.');
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const getGroupMembersRpc = 'get_group_members_with_count' as never;
  const getGroupMembersParams = {
    p_user_id: user.id,
    p_group_id: groupId,
  } as never;
  const { data, error } = await supabase.rpc(
    getGroupMembersRpc,
    getGroupMembersParams,
  );

  if (error) {
    if (error.code === '42501') {
      return actionError(
        'forbidden',
        '그룹을 찾을 수 없거나 접근 권한이 없습니다.',
      );
    }
    return actionError('server-error', '그룹 멤버를 불러올 수 없습니다.');
  }

  const row = ((data as GetGroupMembersRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '그룹 멤버를 불러올 수 없습니다.');
  }
  if (!row.ok) {
    if (row.error_code === 'forbidden') {
      return actionError(
        'forbidden',
        '그룹을 찾을 수 없거나 접근 권한이 없습니다.',
      );
    }
    if (row.error_code === 'invalid-format') {
      return actionError('invalid-format', '그룹 정보가 필요합니다.');
    }
    return actionError('server-error', '그룹 멤버를 불러올 수 없습니다.');
  }

  const members = mapRpcMembers(row.members);
  const memberCount =
    typeof row.member_count === 'number' ? row.member_count : members.length;

  return actionSuccess({
    memberCount,
    members,
    currentUserId: user.id,
  });
}
