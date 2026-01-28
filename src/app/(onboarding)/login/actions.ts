'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/server';

function looksLikeEmail(email: string): boolean {
  // 이메일 정규식
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type LoginActionResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'missing-fields'
        | 'invalid-email'
        | 'invalid-credentials'
        | 'forbidden-origin'
        | 'login-failed';
    };

/**
 * CSRF: Cross-Site Request Forgery
 * -> 로그인된 사용자를 속여서, 사용자의 의지와 무관한 요청을 보내게 하는 공격
 * CSRF 완화를 위한 기본 동일 출처 검사.
 * - 없으면 허용 (일부 동일 사이트 양식 제출은 이를 생략할 수 있음)
 * - 있으면 현재 호스트와 일치해야 함.
 */
function isSameOriginRequest(h: Headers): boolean {
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  if (!host) return true; // host가 없으면 과하게 막지 않음

  const origin = h.get('origin');
  const referer = h.get('referer');

  // 둘 다 없으면 허용 (same-site POST 중 일부 케이스)
  if (!origin && !referer) return true;

  const matchesHost = (value: string) => {
    try {
      const u = new URL(value);
      return u.host === host;
    } catch {
      return false;
    }
  };

  if (origin && !matchesHost(origin)) return false;
  if (!origin && referer && !matchesHost(referer)) return false;

  return true;
}

/**
 * 실무형 Server Action:
 * - origin/referer 체크 (JWT 토큰을 쿠키로 자동사용하는 경우 CSRF 방지)
 * - 입력 검증/정규화
 * - Supabase 에러 메시지 노출 최소화
 * - rate limiting (optional, 생략됨)
 * - useActionState (React 19+)
 */

export async function loginAction(
  email: string,
  password: string,
): Promise<LoginActionResult> {
  const h = headers();

  // 1) Same-origin check (CSRF 완화)
  if (!isSameOriginRequest(h)) {
    return { ok: false, error: 'forbidden-origin' };
  }

  // 2) 입력 정규화 및 검증
  const normalizedEmail = String(email ?? '')
    .trim()
    .toLowerCase();
  const normalizedPassword = String(password ?? '').trim();

  if (!normalizedEmail || !normalizedPassword) {
    return { ok: false, error: 'missing-fields' };
  }

  if (!looksLikeEmail(normalizedEmail)) {
    return { ok: false, error: 'invalid-email' };
  }

  const supabase = createSupabaseServerClient();

  const { data: _data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: normalizedPassword,
  });

  // 3) 에러 메시지 노출 최소화
  if (error) {
    const isInvalidCreds =
      error.message?.toLowerCase().includes('invalid login credentials') ||
      error.message?.toLowerCase().includes('invalid credentials') ||
      error.status === 400;
    return {
      ok: false,
      error: isInvalidCreds ? 'invalid-credentials' : 'login-failed',
    };
  }

  redirect('/dashboard');
  return { ok: true };
}
