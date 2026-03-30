import { useEffect, useState } from 'react';
import { authClient } from '@/lib/authClient';
import { useRouter } from 'expo-router';

export type OnboardingStatus = {
  isCompleted: boolean;
  isLoading: boolean;
  profile: any | null; // you can type this better later
};

export function useOnboardingStatus() {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus>({
    isCompleted: false,
    isLoading: true,
    profile: null,
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Get current session from Better Auth (client-side)
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          setStatus({ isCompleted: false, isLoading: false, profile: null });
          return;
        }

        // Call a lightweight API to check profile
        const res = await fetch('/api/onboarding-status');
        const data = await res.json();

        const isCompleted = data.hasCompletedOnboarding === true;

        setStatus({
          isCompleted,
          isLoading: false,
          profile: data,
        });

        // Auto-redirect if already completed
        if (isCompleted) {
          router.replace('/home');
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setStatus({ isCompleted: false, isLoading: false, profile: null });
      }
    };

    checkOnboarding();
  }, [router]);

  return status;
}