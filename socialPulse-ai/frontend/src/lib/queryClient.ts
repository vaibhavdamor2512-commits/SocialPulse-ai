/**
 * src/lib/queryClient.ts
 * TanStack Query client configuration.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 2 minutes before refetching
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once (IBM API can be slow on cold start)
      retry: 1,
      retryDelay: 1500,
      // Don't refetch when the window regains focus (avoids hammering IBM APIs)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
