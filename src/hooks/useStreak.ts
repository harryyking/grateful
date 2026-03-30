// hooks/useStreak.ts
import { authClient } from '@/lib/authClient';
import { queryClient } from '@/lib/QueryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface StreakData {
  streakCount: number;
  status: string;
}

export function useStreak() {
  const { data, isLoading } = useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: async () => {
      const cookieHeader = authClient.getCookie()
      const res = await fetch('/api/streaks', {
        
        method: 'GET',
        headers: {
          "Cookie": cookieHeader || ''
        },
        credentials: 'omit'

      });
      if (!res.ok) throw new Error('Failed to fetch streak');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes is good
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const cookieHeader = authClient.getCookie();
      const res = await fetch('/api/streaks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader || '',
        },
      });

      if (!res.ok) throw new Error('Failed to update streak');
      return res.json() as Promise<StreakData>;
    },

    onSuccess: (newData) => {
      // Primary: instant update with server data
      queryClient.setQueryData(['streak'], newData);

      // Optional safety net: refetch in background (very cheap)
      // This ensures the cache is 100% in sync even if something weird happens
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
  });

  return {
    streakCount: data?.streakCount ?? 0,
    status: data?.status ?? 'Growing',
    isLoading,
    updateStreak: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}