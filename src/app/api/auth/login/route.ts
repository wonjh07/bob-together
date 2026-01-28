import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

type Body = {
  email: string;
  password: string;
};

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
} as const;

const looksLikeEmail = (value: string) => {
  // intentionally simple: enough to catch empty/obvious invalid inputs
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export async function POST(req: NextRequest) {

  // contentType: 컨텐츠 타입 검사
  // 목적: 의도치 않은 폼 전송/텍스트 전송을 차단

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { ok: false, error: 'unsupported-content-type' },
      { status: 415, headers: NO_STORE_HEADERS },
    );
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  const email = (body?.email ?? '').trim().toLowerCase();
  const password = (body?.password ?? '').trim();

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: 'missing-fields' },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'invalid-email' },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
  
    // isInvalidCreds: 인증에러 메시지 노출 최소화
    // error.message를 그대로 사용하지 않음

    const isInvalidCreds =
      (error.status === 400 || error.status === 401) &&
      /invalid\s+login\s+credentials|invalid\s+credentials/i.test(error.message);

    return NextResponse.json(
      { ok: false, error: isInvalidCreds ? 'invalid-credentials' : 'login-failed' },
      { status: isInvalidCreds ? 401 : 500, headers: NO_STORE_HEADERS },
    );
  }

  // 캐시 방지 헤더
  // 민감한 정보가 포함될 수 있는 응답이 브라우저나 중간 캐시에 저장되지 않도록 함
  return NextResponse.json(
    {
      ok: true,
      userId: user?.id ?? null,
    },
    { status: 200, headers: NO_STORE_HEADERS },
  );
}
