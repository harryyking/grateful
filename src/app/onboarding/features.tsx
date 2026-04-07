import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GRATEFUL_THEME } from '@/design/theme';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';

// ─────────────────────────────────────────────────────────────
// LOCAL ASSETS IMPORTS (bundled with your app → instant loading)
// ─────────────────────────────────────────────────────────────
const dailyPromisesImg = require('@/assets/images/mockup-forest.png');
const dailyRemindersImg = require('@/assets/images/notification.png');
const widgetAccessImg = require('@/assets/images/widget.png');
const setThemesImg = require('@/assets/images/mockup-customize.png');

const { width } = Dimensions.get('window');
const { colors, radius } = GRATEFUL_THEME.light;

const DATA = [
  {
    id: '1',
    title: 'Daily Promises',
    desc: 'Start every morning with a sacred word to ground your identity and find peace.',
    image: dailyPromisesImg,
  },
  {
    id: '2',
    title: 'Daily Reminders',
    desc: 'Custom notifications that act as a shield during your most vulnerable hours.',
    image: dailyRemindersImg,
  },
  {
    id: '3',
    title: 'Widget Access',
    desc: 'Keep the word visible with beautiful home screen widgets for instant strength.',

    image: widgetAccessImg,
  },
  {
    id: '4',
    title: 'Set Themes',
    desc: 'Choose from dawn, midday, or midnight themes to suit your quiet time.',
    image: setThemesImg,
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
      <View style={styles.imageContainer}>
        <Image
          source={item.image}           // ← now local asset
          style={styles.image}
          contentFit="contain"
          transition={500}
          cachePolicy="memory-disk"
        />
      </View>

      <View style={styles.textContainer}>
        <Text variant="h1" style={styles.title}>{item.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{item.desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Glow */}
      <View style={styles.ambientGlowTop} />

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
              outputRange: [8, 22, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
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

        <TouchableOpacity
          style={styles.button}
          onPress={scrollToNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {currentIndex === DATA.length - 1 ? '👀See app features' : 'Continue'}
          </Text>
          <MaterialIcons name="chevron-right" size={22} color="#FFF" />
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
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primarySoft,
    opacity: 0.2,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: width * 0.75,
    height: width * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: colors.foreground,
  },
  divider: {
    width: 45,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginVertical: 24,
    opacity: 0.5,
  },
  description: {
    fontSize: 17,
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    maxWidth: 320,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '700',
  },
});