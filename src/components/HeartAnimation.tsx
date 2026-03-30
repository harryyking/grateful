// Place this near the top of your file, outside of the App component
import React from "react";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence, 
  withTiming, 
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { scheduleOnRN } from 'react-native-worklets';   // ← NEW

interface HeartAnimationProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

export const HeartAnimation = ({ isActive, onAnimationComplete }: HeartAnimationProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      // Reset values first
      scale.value = 0;
      opacity.value = 0;

      // 1. Pop in with overshoot
      scale.value = withSequence(
        withSpring(1.4, { damping: 10, stiffness: 220 }),
        withSpring(1, { damping: 15, stiffness: 180 })
      );

      // 2. Fade out after a short hold
      opacity.value = withSequence(
        withTiming(1, { duration: 0 }),     // instantly visible
        withTiming(1, { duration: 700 }),   // hold for ~700ms
        withTiming(0, { duration: 400 }, (finished) => {
          if (finished) {
            scheduleOnRN(onAnimationComplete);   // ← this is the modern replacement
          }
        })
      );
    }
  }, [isActive, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -60,
    marginLeft: -60,
    zIndex: 999,
    pointerEvents: "none",
  }));

  // Don't render when invisible
  if (!isActive && opacity.value === 0) return null;

  return (
    <Animated.View style={animatedStyle}>
      <MaterialIcons name="favorite" size={120} color="#E6C27A" />
    </Animated.View>
  );
};