'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupNameSchema } from '@/schemas/group';

import { mapGroup, type CreateGroupResult } from './_shared';

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
