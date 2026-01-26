import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';

type Body = {
  email: string;
  password: string;
};

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { ok: false, error: 'missing-fields' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      userId: data.user?.id ?? null,
    },
    { status: 200 },
  );
}
