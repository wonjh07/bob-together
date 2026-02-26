import { createQueryScope } from '@/libs/query/queryScope';
import { createSupabaseServerClient } from '@/libs/supabase/server';

export async function getServerQueryScope() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return createQueryScope(user?.id ?? null);
}
