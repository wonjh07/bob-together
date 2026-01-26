import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', url.origin));
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=exchange_failed', url.origin),
    );
  }

  // ✅ 세션 쿠키 세팅 완료 → 원하는 페이지로 보내기
  return NextResponse.redirect(new URL('/', url.origin));
}
