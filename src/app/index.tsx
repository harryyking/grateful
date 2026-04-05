// app/index.tsx
import { Redirect } from 'expo-router';
import { useProfileStore } from '@/store/ProfileStore';
import { useShallow } from 'zustand/shallow';

export default function Index() {
  const { hasCompletedOnboarding, hasHydrated } = useProfileStore(
    useShallow((state) => ({
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      hasHydrated: state.hasHydrated,
    }))
  );

  // Wait for store hydration (prevents flashing wrong screen)
  if (!hasHydrated) {
    return null; // Splash screen stays visible thanks to _layout
  }

  // Smart redirect based on onboarding status
  return <Redirect href={hasCompletedOnboarding ? '/home' : '/onboarding'} />;
}