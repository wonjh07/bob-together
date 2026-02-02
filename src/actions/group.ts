'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupNameSchema, groupSearchSchema } from '@/schemas/group';

import type { ActionResult, GroupErrorCode } from '@/types/result';

export interface GroupSummary {
  groupId: string;
  name: string;
}

export interface UserSummary {
  userId: string;
  name?: string | null;
  nickname?: string | null;
}

export type CreateGroupResult = ActionResult<GroupSummary, GroupErrorCode>;
export type FindGroupResult = ActionResult<GroupSummary, GroupErrorCode>;
export type GetGroupResult = ActionResult<GroupSummary, GroupErrorCode>;
export type JoinGroupResult = ActionResult<{ groupId: string }, GroupErrorCode>;
export type SearchGroupsResult = ActionResult<
  { groups: GroupSummary[] },
  GroupErrorCode
>;
export type GetMyGroupsResult = ActionResult<
  { groups: GroupSummary[] },
  GroupErrorCode
>;
export type SearchUsersResult = ActionResult<{ users: UserSummary[] }, GroupErrorCode>;
export type SendInvitationResult = ActionResult<void, GroupErrorCode>;

const mapGroup = (group: { group_id: string; name: string }): GroupSummary => ({
  groupId: group.group_id,
  name: group.name,
});

const mapUser = (user: {
  user_id: string;
  name?: string | null;
  nickname?: string | null;
}): UserSummary => ({
  userId: user.user_id,
  name: user.name ?? null,
  nickname: user.nickname ?? null,
});

export async function createGroupAction(
  groupName: string,
): Promise<CreateGroupResult> {
  const parsed = groupNameSchema.safeParse(groupName);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '그룹명을 입력해주세요.',
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

  const normalizedName = parsed.data;

  const { data: existingGroups, error: checkError } = await supabase
    .from('groups')
    .select('group_id')
    .eq('name', normalizedName)
    .limit(1);

  if (checkError) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 확인 중 오류가 발생했습니다.',
    };
  }

  if (existingGroups && existingGroups.length > 0) {
    return {
      ok: false,
      error: 'group-name-taken',
      message: '이미 존재하는 그룹명입니다.',
    };
  }

  const { data: createdGroup, error: createError } = await supabase
    .from('groups')
    .insert({ name: normalizedName, owner_id: userData.user.id })
    .select('group_id, name')
    .single();

  if (createError || !createdGroup) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 생성 중 오류가 발생했습니다.',
    };
  }

  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: createdGroup.group_id,
    user_id: userData.user.id,
    role: 'owner',
  });

  if (memberError) {
    await supabase.from('groups').delete().eq('group_id', createdGroup.group_id);
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 멤버 등록 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: mapGroup(createdGroup),
  };
}

export async function findGroupByNameAction(
  groupName: string,
): Promise<FindGroupResult> {
  const parsed = groupNameSchema.safeParse(groupName);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '그룹명을 입력해주세요.',
    };
  }

  const supabase = createSupabaseServerClient();
  const normalizedName = parsed.data;

  const { data, error } = await supabase
    .from('groups')
    .select('group_id, name')
    .eq('name', normalizedName)
    .limit(2);

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹을 찾는 중 오류가 발생했습니다.',
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error: 'group-not-found',
      message: '해당 그룹을 찾을 수 없습니다.',
    };
  }

  if (data.length > 1) {
    return {
      ok: false,
      error: 'group-name-duplicated',
      message: '동일한 그룹명이 여러 개 존재합니다.',
    };
  }

  return {
    ok: true,
    data: mapGroup(data[0]),
  };
}

export async function getGroupByIdAction(
  groupId: string,
): Promise<GetGroupResult> {
  if (!groupId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
    };
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('groups')
    .select('group_id, name')
    .eq('group_id', groupId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      error: 'group-not-found',
      message: '그룹을 찾을 수 없습니다.',
    };
  }

  return {
    ok: true,
    data: mapGroup(data),
  };
}

export async function joinGroupAction(
  groupId: string,
): Promise<JoinGroupResult> {
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

  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('group_id')
    .eq('group_id', groupId)
    .maybeSingle();

  if (groupError || !groupData) {
    return {
      ok: false,
      error: 'group-not-found',
      message: '그룹을 찾을 수 없습니다.',
    };
  }

  const { data: memberData, error: memberCheckError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (memberCheckError) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 상태를 확인할 수 없습니다.',
    };
  }

  if (memberData) {
    return {
      ok: true,
      data: { groupId },
    };
  }

  const { error: joinError } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: userData.user.id,
    role: 'member',
  });

  if (joinError) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 가입 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: { groupId },
  };
}

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

export async function searchGroupsAction(
  query: string,
): Promise<SearchGroupsResult> {
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
  const normalizedQuery = parsed.data;

  const { data, error } = await supabase
    .from('groups')
    .select('group_id, name')
    .ilike('name', `%${normalizedQuery}%`)
    .order('name')
    .limit(6);

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 검색 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: {
      groups: (data || []).map(mapGroup),
    },
  };
}

export async function getMyGroupsAction(): Promise<GetMyGroupsResult> {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(name)')
    .eq('user_id', userData.user.id)
    .order('joined_at', { ascending: false });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 정보를 불러올 수 없습니다.',
    };
  }

  const groups = (data || [])
    .map(
      (row) =>
        ({
          group_id: row.group_id,
          name: row.groups?.name ?? '알 수 없음',
        }) as { group_id: string; name: string },
    )
    .map(mapGroup);

  return {
    ok: true,
    data: { groups },
  };
}

export async function sendGroupInvitationAction(
  groupId: string,
  inviteeId: string,
): Promise<SendInvitationResult> {
  if (!groupId || !inviteeId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '초대 정보가 부족합니다.',
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

  if (userData.user.id === inviteeId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '본인은 초대할 수 없습니다.',
    };
  }

  const { data: inviterMembership, error: inviterError } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (inviterError || !inviterMembership) {
    return {
      ok: false,
      error: 'forbidden',
      message: '그룹 멤버만 초대할 수 있습니다.',
    };
  }

  const { data: existingMember } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', inviteeId)
    .maybeSingle();

  if (existingMember) {
    return {
      ok: false,
      error: 'already-member',
      message: '이미 그룹에 가입된 사용자입니다.',
    };
  }

  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('invitation_id')
    .eq('group_id', groupId)
    .eq('invitee_id', inviteeId)
    .eq('type', 'group')
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInvite) {
    return {
      ok: false,
      error: 'invite-already-sent',
      message: '이미 초대가 발송되었습니다.',
    };
  }

  const { error: inviteError } = await supabase.from('invitations').insert({
    group_id: groupId,
    inviter_id: userData.user.id,
    invitee_id: inviteeId,
    type: 'group',
    status: 'pending',
  });

  if (inviteError) {
    return {
      ok: false,
      error: 'server-error',
      message: '초대 전송 중 오류가 발생했습니다.',
    };
  }

  return { ok: true };
}
