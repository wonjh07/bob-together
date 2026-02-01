'use server';

import { redirect } from 'next/navigation';

import { loginSchema, signupSchema } from '@/schemas/auth';
import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { ActionResult, AuthErrorCode } from '@/types/result';

// ============================================================================
// Login
// ============================================================================

export type LoginActionResult = ActionResult<void, AuthErrorCode>;

/**
 * Server Action: Login
 * - Input validation (Zod)
 * - Minimize Supabase error message exposure
 * - CSRF protection automatically handled by Next.js (Origin/Host header comparison)
 */
export async function loginAction(
  email: string,
  password: string,
): Promise<LoginActionResult> {
  // Zod input validation
  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-email',
      message: firstError?.message || '입력값이 올바르지 않습니다.',
    };
  }

  const { email: validatedEmail, password: validatedPassword } = parsed.data;

  const supabase = createSupabaseServerClient();

  const { data: _data, error } = await supabase.auth.signInWithPassword({
    email: validatedEmail,
    password: validatedPassword,
  });

  // Minimize error message exposure
  if (error) {
    const isInvalidCreds =
      error.message?.toLowerCase().includes('invalid login credentials') ||
      error.message?.toLowerCase().includes('invalid credentials') ||
      error.status === 400;
    return {
      ok: false,
      error: isInvalidCreds ? 'invalid-credentials' : 'login-failed',
      message: isInvalidCreds
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : '로그인 중 오류가 발생했습니다.',
    };
  }

  return { ok: true };
}

// ============================================================================
// Signup
// ============================================================================

type SignupParams = {
  email: string;
  password: string;
  name: string;
  nickname: string;
};

export type SignupActionResult = ActionResult<void, AuthErrorCode>;

export async function signupAction(
  params: SignupParams,
): Promise<SignupActionResult> {
  const { email, password, name, nickname } = params;

  // Zod Validation
  const parsed = signupSchema.safeParse({
    email,
    password,
    passwordConfirm: password,
    name,
    nickname,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '입력값이 올바르지 않습니다.',
    };
  }

  const validatedData = parsed.data;
  const supabase = createSupabaseServerClient();

  try {
    const { data: _data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          nickname: validatedData.nickname,
        },
      },
    });

    if (error) {
      return {
        ok: false,
        error: 'signup-failed',
        message: error.message,
      };
    }
  } catch (err) {
    return {
      ok: false,
      error: 'server-error',
      message:
        err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.',
    };
  }

  // Signup success
  redirect('/signup/success');
}

// ============================================================================
// Logout
// ============================================================================

export type LogoutActionResult = ActionResult<void, AuthErrorCode>;

export async function logoutAction(): Promise<LogoutActionResult> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    return {
      ok: false,
      error: 'logout-failed',
      message: error.message,
    };
  }

  redirect('/login');
}
