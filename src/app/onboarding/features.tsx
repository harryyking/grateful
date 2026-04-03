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
import { Image } from 'expo-image'; // Optimized Image Component
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GRATEFUL_THEME } from '@/design/theme';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';

const { width } = Dimensions.get('window');
const { colors, radius } = GRATEFUL_THEME.light;

const DATA = [
  {
    id: '1',
    title: 'Daily Promises',
    desc: 'Start every morning with a sacred word to ground your identity and find peace.',
    image: 'https://o3k82hwwfa.ufs.sh/f/cQKwx0ZpHag1PGJy4ZotiKCfbDrk0elzM8HjWALqUNymES64',
  },
  {
    id: '2',
    title: 'Daily Reminders',
    desc: 'Custom notifications that act as a shield during your most vulnerable hours.',
    image: 'https://o3k82hwwfa.ufs.sh/f/cQKwx0ZpHag1QxDWIaEIRVWjzrd7ePZiY5GAuSp28yM4FtNc',
  },
  {
    id: '3',
    title: 'Widget Access',
    desc: 'Keep the word visible with beautiful home screen widgets for instant strength.',
    image: 'https://o3k82hwwfa.ufs.sh/f/cQKwx0ZpHag17Ch4zLLszunHVADrjbLglahtpE5s28F1TGZW',
  },
  {
    id: '4',
    title: 'Set Themes',
    desc: 'Choose from dawn, midday, or midnight themes to suit your quiet time.',
    image: 'https://o3k82hwwfa.ufs.sh/f/cQKwx0ZpHag1o6HOFxlsG9XMuDq8bIaE435vpAHwBrFjP0lL',
  },
];

export default function FeatureScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  // PRE-FETCH IMAGES: Downloads images to cache immediately on mount
  useEffect(() => {
    const urls = DATA.map(item => item.image);
    Image.prefetch(urls);
  }, []);

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
          source={item.image}
          style={styles.image}
          contentFit="contain"
          transition={500} // Smooth fade-in
          cachePolicy="memory-disk" // Ensure it stays on the device
        />
      </View>

      <View style={styles.textContainer}>
        <Text variant='h1' style={styles.title}>{item.title}</Text>
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
            {currentIndex === DATA.length - 1 ? "Begin your Journey" : "Continue"}
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
  iconRing: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    borderStyle: 'dashed',
    opacity: 0.3,
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
    paddingVertical: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});