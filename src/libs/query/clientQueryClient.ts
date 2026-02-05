import { QueryClient } from '@tanstack/react-query';

export function createClientQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        gcTime: 5 * 60 * 1000,
      },
    },
  });
}
