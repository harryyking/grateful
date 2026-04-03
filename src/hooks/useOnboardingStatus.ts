// hooks/useOnboardingStatus.ts  (or src/hooks/useOnboardingStatus.ts)

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/ProfileStore';

export type OnboardingStatus = {
  isCompleted: boolean;
  isLoading: boolean;
  profile: any | null;   // you can make this a proper type later
};

export function useOnboardingStatus() {
  const router = useRouter();

  // Get only what we need from Zustand (super performant)
  const { hasCompletedOnboarding, hasHydrated, ...profileData } = useProfileStore(
    (state) => ({
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      hasHydrated: state.hasHydrated,
      name: state.name,
      currentState: state.currentState,
      // add any other fields you want to expose here
    })
  );

  // Loading is only true while the store is still hydrating
  const isLoading = !hasHydrated;
  const isCompleted = hasCompletedOnboarding;

  // Auto-redirect when we're ready and onboarding is done
  useEffect(() => {
    if (hasHydrated && isCompleted) {
      router.replace('/home');
    }
  }, [hasHydrated, isCompleted, router]);

  return {
    isCompleted,
    isLoading,
    profile: isLoading ? null : profileData,   // only return real data after hydration
  } satisfies OnboardingStatus;
}