'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { createClientQueryClient } from '@/libs/query/clientQueryClient';
import {
  createQueryScope,
  type QueryScope,
} from '@/libs/query/queryScope';
import { createSupabaseBrowserClient } from '@/libs/supabase/client';
import { QueryScopeProvider } from '@/provider/query-scope-provider';

interface ProvidersProps {
  children: React.ReactNode;
  initialQueryScope: QueryScope;
}

export default function Providers({
  children,
  initialQueryScope,
}: ProvidersProps) {
  const [queryClient] = useState(() => createClientQueryClient());
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [queryScope, setQueryScope] = useState<QueryScope>(initialQueryScope);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // 보안 측면에서 로그아웃 직후에는 기존 캐시를 즉시 제거합니다.
        queryClient.clear();
      }

      setQueryScope(createQueryScope(session?.user?.id ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, supabase]);

  return (
    <QueryClientProvider client={queryClient}>
      <QueryScopeProvider scope={queryScope}>{children}</QueryScopeProvider>
    </QueryClientProvider>
  );
}
