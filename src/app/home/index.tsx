import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  PixelRatio,          // ← NEW
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { router } from "expo-router";
import { GRATEFUL_THEME } from "@/design/theme";
import { useDailyPromises } from "@/hooks/useDailyPromise";
import { GlassButton } from "@/components/ui/GlassButton";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { StreakModal } from "@/components/StreakWidget";
import { useTheme } from "@/services/context/ThemeContext";
import { ImageBackground } from "expo-image";
import StreakGlass from "@/components/StreakGlass";
import { useStreak } from "@/hooks/useStreak";
import { HeartAnimation } from "@/components/HeartAnimation";
import * as Notifications from 'expo-notifications';
import { authClient } from "@/lib/authClient";

import { captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as ImageManipulator from "expo-image-manipulator";
import { useDailyReminders } from "@/hooks/useDailyReminders";
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import GlassTab from "@/components/GlassTab";

const theme = GRATEFUL_THEME.light.colors;
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const PromiseItem = ({ item, index, height, scrollY }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const itemOffset = index * height;
    const opacity = interpolate(
      scrollY.value,
      [itemOffset - height, itemOffset, itemOffset + height],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [itemOffset - height, itemOffset, itemOffset + height],
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );

    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.mainContent, { height }, animatedStyle]}>
      <Text variant="h1" style={styles.quoteText}>
        {item?.finalText}
      </Text>
      <View style={styles.referenceContainer}>
        <Text style={styles.referenceText}>
          {item?.reference?.toUpperCase()}
        </Text>
      </View>
    </Animated.View>
  );
};


export default function App() {
  const { streakCount, updateStreak } = useStreak();
  const { atmosphere } = useTheme();
  const { data: promises } = useDailyPromises();
  const [isVisible, setIsVisible] = useState(false);

  const scanProgress = useSharedValue(0);
  const [listHeight, setListHeight] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const scrollY = useSharedValue(0);
  const listContainerRef = useRef<View>(null);

  const { isEnabled, isLoading: remindersLoading, toggleReminders } = useDailyReminders();

  const [hasAskedForPermission, setHasAskedForPermission] = useState(false);

  const openDonationPaywall = async () => {
    try {

      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          Alert.alert(
            "Thank You! 🙏",
            "Your generous donation helps us reach more people with God's Word.\n\nMay the Lord bless you abundantly!"
          );
          break;

        case PAYWALL_RESULT.RESTORED:
          Alert.alert("Thank You!", "Your continued support is deeply appreciated.");
          break;

        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
          // User closed it or nothing happened → usually do nothing
          break;
      }
    } catch (error: any) {
      console.error("Paywall error:", error);
      Alert.alert("Unable to open donation screen", "Please try again later.");
    }
  };

  useEffect(() => {
    if (remindersLoading || hasAskedForPermission || isEnabled) return;

    // Only ask once per app session and only if reminders are not yet enabled
    const askForReminders = () => {
      Alert.alert(
        "Daily Promise Reminder",
        "Would you like to receive a personalized promise every morning?",
        [
          {
            text: "Not now",
            style: "cancel",
            onPress: () => setHasAskedForPermission(true),
          },
          {
            text: "Yes, enable",
            style: "default",
            onPress: async () => {
              setHasAskedForPermission(true);
              await toggleReminders(true);   // ← This handles permission + scheduling
            },
          },
        ]
      );
    };

    // Small delay so the screen is fully loaded and feels natural
    const timer = setTimeout(askForReminders, 1500);
    return () => clearTimeout(timer);
  }, [remindersLoading, isEnabled, hasAskedForPermission, toggleReminders])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanProgress.value * listHeight }],
    opacity: interpolate(
      scanProgress.value,
      [0, 0.1, 0.9, 1],
      [0, 1, 1, 0]
    ),
  }));

  const handleShare = async () => {
    if (!listContainerRef.current || listHeight === 0) {
      Alert.alert("Error", "Could not capture the promise");
      return;
    }

    // Measure exact position of the main content area
    const position = await new Promise<{ x: number; y: number; width: number; height: number } | null>((resolve) => {
      listContainerRef.current?.measureInWindow((x, y, width, height) => {
        resolve({ x, y, width, height });
      });
    });

    if (!position) {
      Alert.alert("Error", "Could not measure content area");
      return;
    }

    // Trigger scan animation
    scanProgress.value = 0;
    scanProgress.value = withTiming(1, { duration: 900 });

    try {
      // Wait for animation to finish + small buffer
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // FORCE HIDE scan line so it never appears in the final image
      scanProgress.value = 2;

      // Tiny extra delay to let Reanimated update opacity
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Capture full screen
      const uri = await captureScreen({
        format: "png",
        quality: 0.95,
      });

      // CRITICAL: Scale crop by PixelRatio (fixes magnified/zoomed image on iOS)
      const pixelRatio = PixelRatio.get();
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            crop: {
              originX: Math.round(position.x * pixelRatio),
              originY: Math.round(position.y * pixelRatio),
              width: Math.round(position.width * pixelRatio),
              height: Math.round(position.height * pixelRatio),
            },
          },
        ],
        { compress: 0.95, format: ImageManipulator.SaveFormat.PNG }
      );

      await Sharing.shareAsync(manipResult.uri, {
        mimeType: "image/png",
        dialogTitle: "Share this promise",
        UTI: "public.png",
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Share failed", "Could not share the image");
    }
  };

  const handleFavoritePress = () => {
    updateStreak();  
    setShowHeartAnimation(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: atmosphere.color }]}>
      {/* Full Screen Background */}
      {atmosphere.image && (
        <ImageBackground
          source={atmosphere.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={500}
          cachePolicy="memory-disk"
        />
      )}

      {/* Top Navigation */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <GlassButton icon={'person'} onPress={() => router.push('/profile')} />
        </View>

        <View style={styles.navRight}>
          <StreakGlass current={streakCount} max={50} />
        </View>
      </View>

      {/* Main Content — exact area we crop */}
      <View
        ref={listContainerRef}
        style={styles.listContainer}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
      >
        {listHeight > 0 && promises?.length > 0 && (
          <AnimatedFlashList
            data={promises}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            snapToInterval={listHeight}
            decelerationRate="fast"
            snapToAlignment="start"
            renderItem={({ item, index }) => (
              <PromiseItem
                item={item}
                index={index}
                height={listHeight}
                scrollY={scrollY}
              />
            )}
          />
        )}
      </View>

      <HeartAnimation
        isActive={showHeartAnimation}
        onAnimationComplete={() => setShowHeartAnimation(false)}
      />

      {/* Scan line (now guaranteed hidden before capture) */}
      <Animated.View style={[styles.scanLine, scanLineStyle]} />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionIcon} onPress={handleShare}>
            <MaterialIcons name="ios-share" size={40} color={theme.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={handleFavoritePress}>
            <MaterialIcons name="favorite-border" size={40} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomTabBar}>
          <GlassButton icon={'widgets'} onPress={() => router.push('/widget')} />
            <GlassTab icon={'volunteer-activism'} onPress={openDonationPaywall}/>
          <GlassButton icon={'format-paint'} onPress={() => router.push('/themes')} />
        </View>
      </View>

      <StreakModal isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  listContainer: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 50,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  quoteText: {
    fontSize: 32,
    lineHeight: 48,
    textAlign: "center",
    color: theme.foreground,
  },
  referenceContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  referenceText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 4,
    color: theme.foreground,
    opacity: 0.4,
  },
  footer: {
    paddingBottom: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 32,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 16,
  },
  actionIcon: {
    opacity: 0.4,
    marginHorizontal: 24,
  },
  bottomTabBar: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 400,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.foreground,
    shadowColor: theme.foreground,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
});