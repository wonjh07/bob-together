import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인된 사용자가 있을 때만 signOut 호출
  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath('/', 'layout');
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  });
}
