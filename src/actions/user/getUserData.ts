'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type { GetUserDataResult, UserData } from './_shared';

export async function getUserData(): Promise<GetUserDataResult> {
  const state = await runServiceAction({
    serverErrorMessage: '사용자 정보 불러오기 실패',
    run: async ({ requestId }) => {
      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;

      const { data: userRow, error: userRowError } = await supabase
        .from('users')
        .select('name,nickname,profile_image')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userRowError) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '사용자 정보 불러오기 실패',
          error: {
            code: userRowError.code,
            message: userRowError.message,
            details: userRowError.details,
            hint: userRowError.hint,
          },
        });
      }

      const profileImage =
        userRow?.profile_image ??
        user.user_metadata?.profileImage ??
        user.user_metadata?.avatar_url ??
        null;

      const userData: UserData = {
        id: user.id,
        email: user.email,
        name: userRow?.name ?? user.user_metadata?.name,
        nickname: userRow?.nickname ?? user.user_metadata?.nickname,
      };

      if (profileImage) {
        userData.profileImage = profileImage;
      }

      return createActionSuccessState({
        requestId,
        data: userData,
      });
    },
  });

  return toActionResult(state);
}
