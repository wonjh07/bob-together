'use server';

import { createSupabaseAdminClient } from '@/libs/supabase/server';

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
    // Use Admin client (bypass RLS)
    const supabase = createSupabaseAdminClient();

    // Check if email exists in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Email check error:', error);
      return {
        ok: false,
        error: 'check-failed',
        message: 'Failed to check email',
      };
    }

    return { ok: true, data: { exists: !!data } };
  } catch (error) {
    console.error('Email check error:', error);
    return {
      ok: false,
      error: 'server-error',
      message: 'Server error occurred',
    };
  }
}
