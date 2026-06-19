// app/_layout.tsx
import "react-native-gesture-handler";

import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/QueryClient";

import { GRATEFUL_THEME } from "@/design/theme";

import * as SplashScreen from "expo-splash-screen";
import {BackgroundFetchResult, BackgroundFetchStatus, } from "expo-background-fetch"
import {BackgroundTaskStatus, getStatusAsync, registerTaskAsync} from "expo-background-task"
import * as TaskManager from "expo-task-manager";

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
import { AppState, AppStateStatus, StatusBar } from "react-native";
import { ThemeProvider } from "@/services/context/ThemeContext";

import { useShallow } from "zustand/shallow";
import { useProfileStore } from "@/store/ProfileStore";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

import { scheduleAllUpcomingWidgets } from "@/widgets/DailyPromiseWidget";
import { commitDailyPromises, getTodaysDailyPromises } from "@/store/DailyPromisesStore";
import { storage } from "@/store/SeenPromisesStore";

SplashScreen.preventAutoHideAsync();

// ── Background task ────────────────────────────────────────────────────────
// Defined at module scope (outside any component) as required by expo-task-manager.
// iOS will wake the app periodically and run this even when the user hasn't
// opened the app — ensuring the widget schedule never runs dry.
const WIDGET_REFRESH_TASK = "widget-daily-refresh";

TaskManager.defineTask(WIDGET_REFRESH_TASK, async () => {
  try {
    await scheduleAllUpcomingWidgets(30);
    return BackgroundFetchResult.NewData;
  } catch (err) {
    console.error("[WidgetRefresh] Background task failed:", err);
    return BackgroundFetchResult.Failed;
  }
});

async function registerWidgetRefreshTask() {
  try {
    const status = await getStatusAsync();

    // If background fetch is restricted (e.g. Low Power Mode), bail out gracefully
    if (
      status === BackgroundTaskStatus.Restricted
    ) {
      console.warn("[WidgetRefresh] Background fetch is restricted or denied.");
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(WIDGET_REFRESH_TASK);
    if (!isRegistered) {
      await registerTaskAsync(WIDGET_REFRESH_TASK, {
        minimumInterval: 60 * 60 * 12, 
      });
      console.log("[WidgetRefresh] Background task registered.");
    }
  } catch (err) {
    console.error("[WidgetRefresh] Failed to register background task:", err);
  }
}

// ── Root Layout ────────────────────────────────────────────────────────────
export default function RootLayout() {
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

  const fontsLoaded = dmSansLoaded && domineLoaded;
  const fontError = dmSansError || domineError;
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

  useEffect(() => {
  const todayKey = new Date().toDateString();
  const lastCommitted = storage.getString('last_committed_date');

  if (lastCommitted !== todayKey) {
    const { promises } = getTodaysDailyPromises();
    commitDailyPromises(promises.map(p => p.id));
    storage.set('last_committed_date', todayKey);
  }
}, []);

  // ── Widget scheduling ──────────────────────────────────────────────────
  // Strategy (3 layers so the widget is always fresh):
  //   1. Schedule immediately when the app is ready (covers first launch & updates)
  //   2. Re-schedule every time the app comes to the foreground (AppState)
  //   3. Background task fires every ~12 h for users who rarely open the app
  useEffect(() => {
    if (!isReady) return;

    // Layer 1: schedule on mount
    scheduleAllUpcomingWidgets(30).catch((err: any) =>
      console.error("[WidgetRefresh] Initial schedule failed:", err)
    );

    // Layer 2: re-schedule on foreground
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          scheduleAllUpcomingWidgets(30).catch((err: any) =>
            console.error("[WidgetRefresh] Foreground schedule failed:", err)
          );
        }
      }
    );

    // Layer 3: register the background task
    registerWidgetRefreshTask();

    return () => {
      subscription.remove();
    };
  }, [isReady]);

  // RevenueCat
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

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="dark-content" />

            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: GRATEFUL_THEME.light.colors.background,
                },
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
              <Stack.Screen
                name="themes/index"
                options={{
                  presentation: "pageSheet",
                  sheetAllowedDetents: [0.9],
                  sheetInitialDetentIndex: 0,
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 20,
                }}
              />
              <Stack.Screen
                name="widget/index"
                options={{
                  presentation: "pageSheet",
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