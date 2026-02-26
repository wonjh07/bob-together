'use server';

import { redirect } from 'next/navigation';

import { actionError } from '@/actions/_common/result';
import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { LogoutActionResult } from './_shared';

export async function logoutAction(): Promise<LogoutActionResult> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    return actionError('logout-failed', error.message);
  }

  redirect('/login');
}
