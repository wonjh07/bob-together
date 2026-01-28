import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient();

  // getUser()는 "현재 토큰이 유효한지"까지 확인하는 용도로 가장 안정적
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json(
      { ok: false, user: null, error: error?.message ?? 'no-session' },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata,
        // signUp에서 넣은 name/nickname 등
      },
    },
    { status: 200 },
  );
}
