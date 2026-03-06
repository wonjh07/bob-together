'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  createPostgrestErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';
import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { ActionResult, ValidationErrorType } from '@/types/result';

// ============================================================================
// Email Validation
// ============================================================================

export type CheckEmailExistsResult = ActionResult<
  { exists: boolean },
  ValidationErrorType
>;

export async function checkEmailExists(
  email: string,
): Promise<CheckEmailExistsResult> {
  const state = await runServiceAction({
    serverErrorMessage: 'Server error occurred',
    run: async ({ requestId }) => {
      if (!email || typeof email !== 'string') {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: 'Invalid email format',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: 'Invalid email format',
        });
      }

      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.rpc('check_email_exists', {
        p_email: normalizedEmail,
      });

      if (error) {
        return createPostgrestErrorState({
          action: 'checkEmailExists.rpc',
          requestId,
          error,
          serverMessage: 'Failed to check email',
        });
      }

      return createActionSuccessState({
        requestId,
        data: { exists: Boolean(data) },
      });
    },
  });

  return toActionResult(state);
}
