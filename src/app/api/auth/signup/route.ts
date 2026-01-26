import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';

type Body = {
  email: string;
  password: string;
  name: string;
  nickname: string;
};

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.email || !body?.password || !body?.name || !body?.nickname) {
    return NextResponse.json(
      { ok: false, error: 'missing-fields' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        name: body.name,
        nickname: body.nickname,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 },
    );
  }

  // 이메일 인증 설정 여부에 따라:
  // - 인증 필요: data.session === null 일 수 있음
  // - 즉시 로그인: data.session 존재
  return NextResponse.json(
    {
      ok: true,
      userId: data.user?.id ?? null,
      sessionExists: !!data.session,
    },
    { status: 200 },
  );
}
