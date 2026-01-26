import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Next.js의 cookies() 객체를 래핑하여 Supabase가 기대하는 인터페이스에 맞춥니다.
        // cookies() 객체는 다음내용이 포함

        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 set이 막히는 경우가 있어요.
            // 그런 경우는 Route Handler / Server Action에서 처리하면 됩니다.
          }
        },
      },
    },
  );
}
