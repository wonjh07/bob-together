'use server';

import { actionError, actionSuccess } from '@/actions/_common/result';
import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { ActionResult, ValidationErrorCode } from '@/types/result';

// ============================================================================
// Email Validation
// ============================================================================

export type CheckEmailExistsResult = ActionResult<
  { exists: boolean },
  ValidationErrorCode
>;

export async function checkEmailExists(
  email: string,
): Promise<CheckEmailExistsResult> {
  if (!email || typeof email !== 'string') {
    return actionError('invalid-format', 'Invalid email format');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return actionError('invalid-format', 'Invalid email format');
  }

  try {
    // Use RPC to avoid exposing table-level permissions for anonymous checks.
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.rpc('check_email_exists', {
      p_email: normalizedEmail,
    });

    if (error) {
      console.error('Email check error:', error);
      return actionError('check-failed', 'Failed to check email');
    }

    return actionSuccess({ exists: Boolean(data) });
  } catch (error) {
    console.error('Email check error:', error);
    return actionError('server-error', 'Server error occurred');
  }
}
