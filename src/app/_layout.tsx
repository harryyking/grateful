// app/_layout.tsx
import "react-native-gesture-handler";

import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/QueryClient";

import { GRATEFUL_THEME } from "@/design/theme";

import * as SplashScreen from "expo-splash-screen";

import {
  useFonts as useDMSans,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import {
  useFonts as useDomine,
  Domine_400Regular,
  Domine_500Medium,
  Domine_600SemiBold,
  Domine_700Bold,
} from "@expo-google-fonts/domine";

import { useCallback, useEffect } from "react";
import { StatusBar } from "react-native";
import { ThemeProvider } from "@/services/context/ThemeContext";

import { useShallow } from 'zustand/shallow';
import { useProfileStore } from "@/store/ProfileStore";
import Purchases, {LOG_LEVEL} from 'react-native-purchases'


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // ← Zustand selectors first (stable with useShallow)
  const { hasHydrated, hasCompletedOnboarding } = useProfileStore(
    useShallow((state) => ({
      hasHydrated: state.hasHydrated,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
    }))
  );


  // Fonts
  const [dmSansLoaded, dmSansError] = useDMSans({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const [domineLoaded, domineError] = useDomine({
    Domine_400Regular,
    Domine_500Medium,
    Domine_600SemiBold,
    Domine_700Bold,
  });

  const fontsLoaded = dmSansLoaded &&  domineLoaded;
  const fontError = dmSansError || domineError;

  // Now isReady is safe
  const isReady = fontsLoaded && hasHydrated;

  const router = useRouter();
  const segments = useSegments();

  // Redirect logic
  useEffect(() => {
    if (!isReady) return;

    const isInOnboarding = segments[0] === "onboarding";

    if (hasCompletedOnboarding && isInOnboarding) {
      router.replace("/home");
    } else if (!hasCompletedOnboarding && !isInOnboarding) {
      router.replace("/onboarding");
    }
  }, [isReady, hasCompletedOnboarding, segments, router]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  // ← RevenueCat configure stays exactly where it is
  useEffect(() => {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);
    const apiKey = __DEV__
      ? process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

    if (!apiKey) {
      console.error("RevenueCat API key is missing!");
      return;
    }

    Purchases.configure({ apiKey });
    console.log("RevenueCat configured with key:", apiKey.slice(0, 8) + "...");
  }, []);

  // CRITICAL: Only return null while still loading
  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="dark-content" />

            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: GRATEFUL_THEME.light.colors.background },
              }}
            >
              {/* Onboarding flow */}
              <Stack.Screen name="onboarding/quiz" />
              <Stack.Screen name="onboarding/features" />
              <Stack.Screen name="onboarding/reviews" />
              <Stack.Screen name="onboarding/index" />

              {/* Protected routes */}
              <Stack.Screen name="home" />
              <Stack.Screen name="profile/index" />
              <Stack.Screen name="themes/index" options={{ presentation: "formSheet",
                  sheetAllowedDetents: [ 0.9],   
                  sheetInitialDetentIndex: 0,           
                  sheetGrabberVisible: true, 
                  sheetCornerRadius: 20,    
               }} />
              <Stack.Screen name="widget/index" options={{ presentation: "formSheet", 
                 sheetAllowedDetents: [0.9],   
                 sheetInitialDetentIndex: 0,           
                 sheetGrabberVisible: true, 
                 sheetCornerRadius: 20, 
              }}
              
              />

              {/* Catch-all */}
              <Stack.Screen name="index" />
            </Stack>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}