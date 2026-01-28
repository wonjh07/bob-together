import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export default async function RootPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;
  redirect(isLoggedIn ? '/dashboard' : '/login');
}
