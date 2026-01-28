import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message, session: null },
      { status: 401 },
    );
  }

  const session = data.session;

  if (!session) {
    return NextResponse.json(
      { ok: true, session: null, message: 'no-session' },
      { status: 200 },
    );
  }

  // ✅ 토큰은 그대로 노출하면 위험하니 마스킹
  const maskToken = (token?: string | null) => {
    if (!token) return null;
    if (token.length <= 20) return '***';
    return `${token.slice(0, 10)}...${token.slice(-10)}`;
  };

  return NextResponse.json(
    {
      ok: true,
      session: {
        access_token: maskToken(session.access_token),
        refresh_token: maskToken(session.refresh_token),
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
    },
    { status: 200 },
  );
}
