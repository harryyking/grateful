// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

// Optional but highly recommended defaults for mobile apps
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries (mobile networks are flaky)
      retry: 2,                    // or 3, or a function for exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 2s → 4s → 8s → cap at 30s

      // Don't refetch on window focus (mobile doesn't have "window")
      refetchOnWindowFocus: false,

      // Good balance: stale after 5 minutes, but keep in cache longer
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 30 * 60 * 1000,      // 30 minutes (garbage collection time, formerly cacheTime)

    },

    mutations: {
      retry: 1, // mutations usually retry less aggressively
    },
  }
});