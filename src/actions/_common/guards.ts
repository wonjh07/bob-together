import { createSupabaseServerClient } from '@/libs/supabase/server';

import {
  createActionRequestId,
  createActionErrorState,
  type ServiceActionState,
} from './service-action';

export async function requireUserService(
  requestId: string = createActionRequestId(),
): Promise<
  | ServiceActionState
  | { ok: true; supabase: ReturnType<typeof createSupabaseServerClient>; user: NonNullable<Awaited<ReturnType<ReturnType<typeof createSupabaseServerClient>['auth']['getUser']>>['data']['user']>; requestId: string }
> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return createActionErrorState({
      requestId,
      code: 'auth',
      message: '로그인이 필요합니다.',
      error: error
        ? {
            code: error.code,
            message: error.message,
          }
        : { message: 'missing-user' },
    });
  }

  return { ok: true, supabase, user: data.user, requestId };
}
