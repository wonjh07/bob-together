'use server';

import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import {
  extractStoragePathFromPublicUrl,
  MAX_PROFILE_IMAGE_SIZE,
  PROFILE_IMAGE_BUCKET,
  type UploadProfileImageResult,
} from './_shared';

export async function uploadProfileImageAction(
  formData: FormData,
): Promise<UploadProfileImageResult> {
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      error: 'invalid-file',
      message: '이미지 파일을 선택해주세요.',
    };
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return {
      ok: false,
      error: 'file-too-large',
      message: '이미지는 200KB 이하만 업로드할 수 있습니다.',
    };
  }

  if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
    return {
      ok: false,
      error: 'invalid-file',
      message: 'JPEG 파일만 업로드할 수 있습니다.',
    };
  }

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
  const { data: existingProfileRow } = await supabase
    .from('users')
    .select('profile_image')
    .eq('user_id', userId)
    .maybeSingle();
  const previousProfileImageUrl = existingProfileRow?.profile_image ?? null;
  const filePath = `${userId}/avatar-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_IMAGE_BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    });

  if (uploadError) {
    return {
      ok: false,
      error: 'upload-failed',
      message: '이미지 업로드 중 오류가 발생했습니다.',
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(filePath);

  const { data: profileRow, error: profileError } = await supabase
    .from('users')
    .update({ profile_image: publicUrl })
    .eq('user_id', userId)
    .select('user_id')
    .maybeSingle();

  if (profileError || !profileRow) {
    await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([filePath]);
    return {
      ok: false,
      error: 'update-failed',
      message: '프로필 이미지 저장에 실패했습니다.',
    };
  }

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      ...data.user.user_metadata,
      profileImage: publicUrl,
    },
  });

  if (authUpdateError) {
    console.error('Failed to sync profileImage metadata:', authUpdateError);
  }

  const previousProfileImagePath = previousProfileImageUrl
    ? extractStoragePathFromPublicUrl(previousProfileImageUrl, PROFILE_IMAGE_BUCKET)
    : null;

  if (previousProfileImagePath && previousProfileImagePath !== filePath) {
    await supabase.storage
      .from(PROFILE_IMAGE_BUCKET)
      .remove([previousProfileImagePath]);
  }

  return { ok: true, data: { profileImageUrl: publicUrl } };
}
