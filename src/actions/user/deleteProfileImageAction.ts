'use server';

import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import {
  extractStoragePathFromPublicUrl,
  PROFILE_IMAGE_BUCKET,
  type DeleteProfileImageResult,
} from './_shared';

export async function deleteProfileImageAction(): Promise<DeleteProfileImageResult> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false,
      error: 'user-not-found',
      message: '로그인 정보를 확인할 수 없습니다.',
    };
  }

  const userId = data.user.id;
  const { data: existingProfileRow, error: profileReadError } = await supabase
    .from('users')
    .select('profile_image')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileReadError) {
    return {
      ok: false,
      error: 'update-failed',
      message: '프로필 이미지 정보를 불러오지 못했습니다.',
    };
  }

  const previousProfileImageUrl = existingProfileRow?.profile_image ?? null;
  const previousProfileImagePath = previousProfileImageUrl
    ? extractStoragePathFromPublicUrl(previousProfileImageUrl, PROFILE_IMAGE_BUCKET)
    : null;

  const { data: updatedProfileRow, error: profileUpdateError } = await supabase
    .from('users')
    .update({ profile_image: null })
    .eq('user_id', userId)
    .select('user_id')
    .maybeSingle();

  if (profileUpdateError || !updatedProfileRow) {
    return {
      ok: false,
      error: 'update-failed',
      message: '프로필 이미지 삭제에 실패했습니다.',
    };
  }

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      ...data.user.user_metadata,
      profileImage: null,
    },
  });

  if (authUpdateError) {
    console.error('Failed to sync profileImage metadata:', authUpdateError);
  }

  if (previousProfileImagePath) {
    const { error: removeError } = await supabase.storage
      .from(PROFILE_IMAGE_BUCKET)
      .remove([previousProfileImagePath]);

    if (removeError) {
      console.error('Failed to remove previous profile image:', removeError);
    }
  }

  return { ok: true, data: undefined };
}
