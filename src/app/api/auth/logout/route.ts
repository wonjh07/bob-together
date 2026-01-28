import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  console.log(` HOST: ${req.headers.get('host')}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인된 사용자가 있을 때만 signOut 호출
  if (user) {
    await supabase.auth.signOut();
  }

  return NextResponse.json(
    { ok: true, message: 'logged out' },
    { status: 200 },
  );
}
