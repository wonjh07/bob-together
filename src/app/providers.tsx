'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { createClientQueryClient } from '@/libs/query/clientQueryClient';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createClientQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
