'use server';

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
    return {
      ok: false,
      error: 'invalid-format',
      message: 'Invalid email format',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      ok: false,
      error: 'invalid-format',
      message: 'Invalid email format',
    };
  }

  try {
    // Use RPC to avoid exposing table-level permissions for anonymous checks.
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.rpc('check_email_exists', {
      p_email: normalizedEmail,
    });

    if (error) {
      console.error('Email check error:', error);
      return {
        ok: false,
        error: 'check-failed',
        message: 'Failed to check email',
      };
    }

    return { ok: true, data: { exists: Boolean(data) } };
  } catch (error) {
    console.error('Email check error:', error);
    return {
      ok: false,
      error: 'server-error',
      message: 'Server error occurred',
    };
  }
}
