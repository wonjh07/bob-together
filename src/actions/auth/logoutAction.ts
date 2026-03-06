'use server';

import { redirect } from 'next/navigation';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';
import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { LogoutActionResult } from './_shared';

export async function logoutAction(): Promise<LogoutActionResult> {
  const state = await runServiceAction({
    serverErrorMessage: '로그아웃에 실패했습니다.',
    run: async ({ requestId }) => {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'auth',
          message: error.message,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  if (!state.ok) {
    return toActionResult(state);
  }

  redirect('/login');
}
