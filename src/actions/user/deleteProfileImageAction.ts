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
  PROFILE_IMAGE_BUCKET,
  type DeleteProfileImageResult,
} from './_shared';

export async function deleteProfileImageAction(): Promise<DeleteProfileImageResult> {
  const state = await runServiceAction({
    serverErrorMessage: '프로필 이미지 삭제에 실패했습니다.',
    run: async ({ requestId }) => {
      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
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
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필 이미지 삭제에 실패했습니다.',
          error: clearProfileImageError
            ? {
                code: clearProfileImageError.code,
                message: clearProfileImageError.message,
                details: clearProfileImageError.details,
                hint: clearProfileImageError.hint,
              }
            : { message: 'missing-clear-profile-image-row' },
        });
      }

      if (!clearProfileImageRow.ok) {
        if (clearProfileImageRow.error_code === 'not-found') {
          return createActionErrorState({
            requestId,
            code: 'not_found',
            message: '프로필 정보를 찾을 수 없습니다.',
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필 이미지 삭제에 실패했습니다.',
          error: { rpcErrorCode: clearProfileImageRow.error_code },
        });
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
          console.error('[action-error]', {
            action: 'deleteProfileImageAction.storage.removePrevious',
            requestId,
            errorType: 'server',
            message: removeError.message,
          });
        }
      }

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          profileImage: null,
        },
      });

      if (authUpdateError) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '프로필 이미지는 삭제되었지만 계정 정보 동기화에 실패했습니다.',
          error: {
            code: authUpdateError.code,
            message: authUpdateError.message,
          },
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
