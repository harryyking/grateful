import { useEffect, useRef } from 'react';
import { Animated, ViewStyle, DimensionValue } from 'react-native';

export const SkeletonLoader = ({ 
  width, 
  height, 
  style, 
  borderRadius = 8 
}: { 
  width: DimensionValue,  // <-- This fixes the generic string error
  height: DimensionValue, // Updated this too just to be safe
  style?: ViewStyle, 
  borderRadius?: number 
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View 
      style={[
        { 
          width, 
          height, 
          backgroundColor: 'rgba(150, 150, 150, 0.2)', 
          borderRadius, 
          opacity 
        }, 
        style
      ]} 
    />
  );
};