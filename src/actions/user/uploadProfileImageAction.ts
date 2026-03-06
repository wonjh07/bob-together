'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import {
  extractStoragePathFromPublicUrl,
  MAX_PROFILE_IMAGE_SIZE,
  PROFILE_IMAGE_BUCKET,
  type UploadProfileImageResult,
} from './_shared';

export async function uploadProfileImageAction(
  formData: FormData,
): Promise<UploadProfileImageResult> {
  const state = await runServiceAction({
    serverErrorMessage: '프로필 이미지 저장에 실패했습니다.',
    run: async ({ requestId }) => {
      const file = formData.get('file');

      if (!(file instanceof File) || file.size === 0) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '이미지 파일을 선택해주세요.',
        });
      }

      if (file.size > MAX_PROFILE_IMAGE_SIZE) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '이미지는 200KB 이하만 업로드할 수 있습니다.',
        });
      }

      if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: 'JPEG 파일만 업로드할 수 있습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;
      const userId = user.id;
      const filePath = `${userId}/avatar-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_IMAGE_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '이미지 업로드 중 오류가 발생했습니다.',
          error: {
            message: uploadError.message,
            error: uploadError,
          },
        });
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(filePath);

      const setProfileImageRpc = 'set_user_profile_image_transactional' as never;
      const setProfileImageParams = {
        p_user_id: userId,
        p_profile_image: publicUrl,
      } as never;
      const { data: setProfileImageData, error: setProfileImageError } =
        await supabase.rpc(setProfileImageRpc, setProfileImageParams);
      type SetProfileImageRpcRow = {
        ok: boolean;
        error_code: string | null;
        previous_profile_image: string | null;
      };
      const setProfileImageRow = (
        (setProfileImageData as SetProfileImageRpcRow[] | null) ?? []
      )[0];

      if (setProfileImageError || !setProfileImageRow) {
        await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([filePath]);
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필 이미지 저장에 실패했습니다.',
          error: setProfileImageError
            ? {
                code: setProfileImageError.code,
                message: setProfileImageError.message,
                details: setProfileImageError.details,
                hint: setProfileImageError.hint,
              }
            : { message: 'missing-set-profile-image-row' },
        });
      }

      if (!setProfileImageRow.ok) {
        await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([filePath]);

        if (setProfileImageRow.error_code === 'not-found') {
          return createActionErrorState({
            requestId,
            code: 'not_found',
            message: '프로필 정보를 찾을 수 없습니다.',
          });
        }

        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필 이미지 저장에 실패했습니다.',
          error: { rpcErrorCode: setProfileImageRow.error_code },
        });
      }

      const previousProfileImageUrl = setProfileImageRow.previous_profile_image;
      const previousProfileImagePath = previousProfileImageUrl
        ? extractStoragePathFromPublicUrl(previousProfileImageUrl, PROFILE_IMAGE_BUCKET)
        : null;

      if (previousProfileImagePath && previousProfileImagePath !== filePath) {
        await supabase.storage
          .from(PROFILE_IMAGE_BUCKET)
          .remove([previousProfileImagePath]);
      }

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          profileImage: publicUrl,
        },
      });

      if (authUpdateError) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필 이미지는 저장되었지만 계정 정보 동기화에 실패했습니다.',
          error: {
            code: authUpdateError.code,
            message: authUpdateError.message,
          },
        });
      }

      return createActionSuccessState({
        requestId,
        data: { profileImageUrl: publicUrl },
      });
    },
  });

  return toActionResult(state);
}
