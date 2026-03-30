import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/authClient';

type TimeOfDay = 'morning' | 'afternoon' | 'night';

function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

export function useDailyPromises() {
  return useQuery({
    queryKey: ['dailyPromises'],           // Unique cache key
    queryFn: async () => {
      const cookieHeader = authClient.getCookie();

      const res = await fetch(`/api/daily-promises`, {
        headers: { 
          "Cookie": cookieHeader || "", 
        },
        credentials: "omit",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.promises || [];
    },
    // Optional: you can make it depend on time of day if you want different promises
    // staleTime: 1000 * 60 * 30, // 30 minutes
  });
}