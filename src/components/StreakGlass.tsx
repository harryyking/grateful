import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';

interface StreakGlassProps {
  current: number;
  max: number;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
}

const StreakGlass = ({ 
  current = 0, 
  max = 5, 
  iconName = 'favorite', 
  iconColor = '#E6C27A' // The golden color from your image
}: StreakGlassProps) => {
  
  // 1. Setup the animated value
  const progress = useSharedValue(0);

  // 2. Safely calculate the fill percentage (clamped between 0 and 1)
  const safeCurrent = Math.min(Math.max(current, 0), max);
  const targetPercentage = max > 0 ? safeCurrent / max : 0;

  // 3. Animate the progress bar when 'current' changes
  useEffect(() => {
    progress.value = withSpring(targetPercentage, {
      mass: 1,
      damping: 15,
      stiffness: 100,
    });
  }, [current, max, targetPercentage]);

  // 4. Map the animated value to the width style
  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.glassWrapper}>
      {/* Native Blur Layer */}
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        
        {/* Icon */}
        <MaterialIcons name={iconName} size={18} color={iconColor} />
        
        {/* Text */}
        <Text style={styles.scoreText}>
          {safeCurrent}/{max}
        </Text>

        {/* Progress Bar Track (The dark/empty part) */}
        <View style={styles.progressTrack}>
          {/* Progress Bar Fill (The animated white part) */}
          <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
        </View>

      </BlurView>
    </View>
  );
};

export default React.memo(StreakGlass);

const styles = StyleSheet.create({
  glassWrapper: {
    height: 36, // Slim, pill-like height
    width: 160, // Fixed width, or you can use minWidth
    borderRadius: 18, // Half of height for perfect pill ends
    overflow: 'hidden', // Clips the BlurView to the pill shape
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Subtle rim lighting
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Base darkness behind the blur
  },
  blurContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 12,
    fontVariant: ['tabular-nums'], // Keeps the width stable when numbers change
  },
  progressTrack: {
    flex: 1, // Takes up remaining horizontal space
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent track
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5F1ED', // Your theme's foreground color
    borderRadius: 3,
  },
});