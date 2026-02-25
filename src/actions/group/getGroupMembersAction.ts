'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type {
  GetGroupMembersResult,
  GroupMemberItem,
} from './_shared';

interface GroupMemberRow {
  user_id: string;
  role: 'owner' | 'member';
  users:
    | {
        name: string | null;
        nickname: string | null;
        profile_image: string | null;
      }
    | null;
}

export async function getGroupMembersAction(
  groupId: string,
): Promise<GetGroupMembersResult> {
  if (!groupId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
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

  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      ok: false,
      error: 'forbidden',
      message: '그룹을 찾을 수 없거나 접근 권한이 없습니다.',
    };
  }

  const { data, count, error } = await supabase
    .from('group_members')
    .select('user_id, role, users(name, nickname, profile_image)', {
      count: 'exact',
    })
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 멤버를 불러올 수 없습니다.',
    };
  }

  const rows = (data as GroupMemberRow[] | null) ?? [];
  const members: GroupMemberItem[] = rows.map((row) => ({
    userId: row.user_id,
    role: row.role,
    name: row.users?.name ?? null,
    nickname: row.users?.nickname ?? null,
    profileImage: row.users?.profile_image ?? null,
  }));

  return {
    ok: true,
    data: {
      memberCount: count ?? members.length,
      members,
      currentUserId: userData.user.id,
    },
  };
}
