'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/server';

type SignupParams = {
  email: string;
  password: string;
  name: string;
  nickname: string;
};

export async function signupAction(params: SignupParams) {
  const { email, password, name, nickname } = params;

  const supabase = createSupabaseServerClient();

  try {
    const { data: _data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          nickname,
        },
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.',
    };
  }
  // 회원가입 성공
  redirect('/signup/success');
}
