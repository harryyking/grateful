import "react-native-gesture-handler";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/QueryClient";

import { GRATEFUL_THEME } from "@/design/theme";

import * as SplashScreen from "expo-splash-screen"; // ← correct import

import {
  useFonts as useDMSans,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import {
  useFonts as usePlayfair,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";

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
import Purchases, {LOG_LEVEL} from 'react-native-purchases'
import { useNetInfo } from "@react-native-community/netinfo";
import { OfflineBlocker } from "@/components/OfflineBlocker";

SplashScreen.preventAutoHideAsync(); // keep at top level

export default function RootLayout() {
  const [dmSansLoaded, dmSansError] = useDMSans({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const [playfairLoaded, playfairError] = usePlayfair({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  });

  const [domineLoaded, domineError] = useDomine({
    Domine_400Regular,
    Domine_500Medium,
    Domine_600SemiBold,
    Domine_700Bold,
  });

  const fontsLoaded = dmSansLoaded && playfairLoaded && domineLoaded;

  const fontError = dmSansError || playfairError || domineError;

  const netInfo = useNetInfo();
  const isOnline = netInfo.isInternetReachable !== false

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) console.error("Font loading failed:", fontError);
  }, [fontError]);

  useEffect(() => {
    // 1. Set log level (super useful for debugging)
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);
  
    // 2. Get the correct key (iOS-only, so no Platform.select needed)
    const apiKey = __DEV__
      ? process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  
    if (!apiKey) {
      console.error(
        '❌ RevenueCat API key is missing!\n' +
        'Make sure you have EXPO_PUBLIC_... variables in your .env file\n' +
        'and restart with: npx expo start -c'
      );
      return;
    }
  
    // 3. Configure (this is the official way)
    Purchases.configure({ apiKey });
  
    console.log('✅ RevenueCat configured with key:', apiKey.slice(0, 8) + '...');
  }, []);

  if (!fontsLoaded && !fontError) {
    return null; 
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="light-content" />
          <OfflineBlocker isOnline={isOnline} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: GRATEFUL_THEME.light.colors.background,
              },
            }}
          >
            <Stack.Screen name="onboarding/index" />
            <Stack.Screen name="index" />
    
            <Stack.Screen
              name="profile/index"
      
            />
            <Stack.Screen
              name="themes/index"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.8, 0.9],
                sheetInitialDetentIndex: 0,
                sheetCornerRadius: 28,
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen
              name="paywall/index"
              options={{
                presentation: "modal",
              }}
            />
            <Stack.Screen name="onboarding/quiz" />
            <Stack.Screen name="onboarding/features" />
            <Stack.Screen name="onboarding/reviews" />
            
            <Stack.Screen name="home/index" />
          

            <Stack.Screen name="widget/index"
               options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.8, 0.9],
                sheetInitialDetentIndex: 0,
                sheetCornerRadius: 28,
                sheetGrabberVisible: true,
              }}
            />
          </Stack>
        </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
