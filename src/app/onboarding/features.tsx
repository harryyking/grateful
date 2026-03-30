import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GRATEFUL_THEME } from '@/design/theme';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { requestNotificationPermission, schedulePersonalizedDailyPromiseNotification } from '@/services/notifications/notifications';
import { useDailyReminders } from '@/hooks/useDailyReminders';

const { width, height } = Dimensions.get('window');
const { colors, radius } = GRATEFUL_THEME.light;

const DATA = [
  {
    id: '1',
    title: 'Daily Promises',
    desc: 'Start every morning with a sacred word to ground your identity and find peace.',
    icon: 'auto-stories',
    accent: colors.primary,
  },
  {
    id: '2',
    title: 'Sacred Nudges',
    desc: 'Custom notifications that act as a shield during your most vulnerable hours.',
    icon: 'notifications-active',
    accent: colors.accent,
  },
  {
    id: '3',
    title: 'Truth at a Glance',
    desc: 'Keep the word visible with beautiful home screen widgets for instant strength.',
    icon: 'widgets',
    accent: colors.primary,
  },
  {
    id: '4',
    title: 'Your Sanctuary',
    desc: 'Choose from dawn, midday, or midnight themes to suit your quiet time.',
    icon: 'palette',
    accent: colors.accentSecondary,
  },
];

export default function FeatureScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  



  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const scrollToNext = () => {
    if (currentIndex < DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/onboarding/reviews');
    }
  };

  const Slide = ({ item }: { item: typeof DATA[0] }) => (
    <View style={styles.slideContainer}>
      
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <MaterialIcons name={item.icon as any} size={70} color={item.accent} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text variant='h1'>{item.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{item.desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <FlatList
        data={DATA}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.2, 1, 0.2],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View 
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: colors.primary }]} 
                key={i.toString()} 
              />
            );
          })}
        </View>

        {/* Action Button with Gradient */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={scrollToNext} 
          activeOpacity={0.9}
        >
            <Text style={styles.buttonText}>
              {currentIndex === DATA.length - 1 ? "Begin your Journey" : "Continue"}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#FFF" />
      
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.glow,
    opacity: 0.6,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  glowBackdrop: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: height * 0.1,
  },
  iconContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    // Refined Shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  iconRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.5,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: 2,
    marginVertical: 20,
  },
  description: {
    fontSize: 17,
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  buttonWrapper: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 22,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
});