'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import {
  extractStoragePathFromPublicUrl,
  PROFILE_IMAGE_BUCKET,
  type DeleteProfileImageResult,
} from './_shared';

export async function deleteProfileImageAction(): Promise<DeleteProfileImageResult> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;
  const clearProfileImageRpc = 'clear_user_profile_image_transactional' as never;
  const clearProfileImageParams = {
    p_user_id: user.id,
  } as never;
  const { data: clearProfileImageData, error: clearProfileImageError } =
    await supabase.rpc(clearProfileImageRpc, clearProfileImageParams);
  type ClearProfileImageRpcRow = {
    ok: boolean;
    error_code: string | null;
    previous_profile_image: string | null;
  };
  const clearProfileImageRow = (
    (clearProfileImageData as ClearProfileImageRpcRow[] | null) ?? []
  )[0];

  if (clearProfileImageError || !clearProfileImageRow) {
    return actionError('update-failed', '프로필 이미지 삭제에 실패했습니다.');
  }

  if (!clearProfileImageRow.ok) {
    if (clearProfileImageRow.error_code === 'not-found') {
      return actionError('profile-not-found', '프로필 정보를 찾을 수 없습니다.');
    }
    return actionError('update-failed', '프로필 이미지 삭제에 실패했습니다.');
  }

  const previousProfileImageUrl = clearProfileImageRow.previous_profile_image;
  const previousProfileImagePath =
    previousProfileImageUrl
      ? extractStoragePathFromPublicUrl(previousProfileImageUrl, PROFILE_IMAGE_BUCKET)
      : null;

  if (previousProfileImagePath) {
    const { error: removeError } = await supabase.storage
      .from(PROFILE_IMAGE_BUCKET)
      .remove([previousProfileImagePath]);

    if (removeError) {
      console.error('Failed to remove previous profile image:', removeError);
    }
  }

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      profileImage: null,
    },
  });

  if (authUpdateError) {
    console.error('Failed to sync profileImage metadata:', authUpdateError);
    return actionError(
      'metadata-sync-failed',
      '프로필 이미지는 삭제되었지만 계정 정보 동기화에 실패했습니다.',
    );
  }

  return actionSuccess();
}
