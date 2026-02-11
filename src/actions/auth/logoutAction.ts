'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { LogoutActionResult } from './_shared';

export async function logoutAction(): Promise<LogoutActionResult> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    return {
      ok: false,
      error: 'logout-failed',
      message: error.message,
    };
  }

  redirect('/login');
}
