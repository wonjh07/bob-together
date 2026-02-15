import { createSupabaseServerClient } from '@/libs/supabase/server';

import { actionError } from './result';

import type { ZodSchema } from 'zod';

export function parseOrFail<T>(
  schema: ZodSchema<T>,
  input: unknown,
) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      'invalid-format',
      parsed.error.issues[0]?.message || '요청 형식이 올바르지 않습니다.',
    );
  }

  return { ok: true as const, data: parsed.data };
}

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return actionError('unauthorized', '로그인이 필요합니다.');
  }

  return { ok: true as const, supabase, user: data.user };
}
