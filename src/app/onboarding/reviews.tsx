import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { GRATEFUL_THEME } from '@/design/theme';
import { useProfileStore } from '@/store/ProfileStore';

const SPACING = 16;
const { colors, radius } = GRATEFUL_THEME.light;

const REVIEWS_DATA = [
  {
    id: '1',
    name: 'Emmanuel Arthur',
    content: "The daily verses always seem to hit exactly what I'm walking through. It's become my favorite way to pause and invite God into my morning.",
    milestone: 'Growing',
  },
  {
    id: '2',
    name: 'Millicent Bloom',
    content: "I've struggled with anxiety for years. Having these promises on my lock screen reminds me He is in control. My mind feels more at peace than ever.",
    milestone: 'Daily Reader',
  },
  {
    id: '3',
    name: 'Susanna Tagoe',
    content: "It's so much more than just an app. The reflections help me apply the Bible to my life as a mother and a professional. A daily breath of fresh air.",
    milestone: 'Spirit Filled',
  },
];

export default function ReviewsScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  // Responsive sizing based on screen dimensions
  const isSmallScreen = height < 700;       // iPhone SE, older iPhones
  const isLargeScreen = height > 900;       // Pro Max, iPads

  const CARD_WIDTH = Math.min(width * 0.85, 420);
  const PADDING_HORIZONTAL = (width - CARD_WIDTH) / 2;

  // Card height scales with screen height
  const CARD_HEIGHT = isSmallScreen ? 200 : isLargeScreen ? 300 : 250;

  // Vertical padding compresses on small screens
  const verticalPadding = isSmallScreen ? 16 : 28;
  const headerTopMargin = isSmallScreen ? 4 : 12;

  const { finishOnboarding } = useProfileStore();

  const handleFinishOnboarding = () => {
    finishOnboarding();
    router.push('/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.contentWrapper, { paddingVertical: verticalPadding }]}>

        {/* Header */}
        <View style={[styles.header, { marginTop: headerTopMargin }]}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="star" size={isSmallScreen ? 28 : 36} color={colors.primary} />
          </View>
          <Text variant="h1" style={isSmallScreen ? styles.titleSmall : undefined}>
            Leave a review
          </Text>
          <Text style={[styles.subhead, isSmallScreen && styles.subheadSmall]}>
            We're a small team, so a rating goes a long way 🤍
          </Text>
        </View>

        {/* Testimonials Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: PADDING_HORIZONTAL },
            ]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {REVIEWS_DATA.map((item, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + SPACING),
                index * (CARD_WIDTH + SPACING),
                (index + 1) * (CARD_WIDTH + SPACING),
              ];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.95, 1, 0.95],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      // last card no right margin needed
                      marginRight: index < REVIEWS_DATA.length - 1 ? SPACING : 0,
                      transform: [{ scale }],
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={[styles.authorText, isSmallScreen && styles.authorTextSmall]}>
                        {item.name}
                      </Text>
                      <View style={styles.milestoneBadge}>
                        <MaterialIcons name="local-fire-department" size={12} color={colors.foreground} />
                        <Text style={styles.milestoneText}>{item.milestone}</Text>
                      </View>
                    </View>
                  </View>

                  <Text
                    style={[styles.quoteText, isSmallScreen && styles.quoteTextSmall]}
                  >
                    "{item.content}"
                  </Text>

                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialIcons key={i} name="star" size={isSmallScreen ? 14 : 18} color={colors.primary} />
                    ))}
                  </View>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>

          {/* Dot indicators */}
          <View style={styles.dotsRow}>
            {REVIEWS_DATA.map((_, index) => {
              const opacity = scrollX.interpolate({
                inputRange: [
                  (index - 1) * (CARD_WIDTH + SPACING),
                  index * (CARD_WIDTH + SPACING),
                  (index + 1) * (CARD_WIDTH + SPACING),
                ],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={index}
                  style={[styles.dot, { opacity }]}
                />
              );
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.button}
            onPress={handleFinishOnboarding}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    backgroundColor: colors.card, // was colors.surface (#FFF) — now matches theme
    padding: 14,
    borderRadius: radius.xl,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(244, 183, 64, 0.2)',
  },
  titleSmall: {
    fontSize: 24,
  },
  subhead: {
    fontSize: 15,
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    opacity: 0.6,
    marginTop: 8,
  },
  subheadSmall: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  // Carousel
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 22,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderInfo: {
    justifyContent: 'center',
    gap: 6,
  },
  authorText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  authorTextSmall: {
    fontSize: 14,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 183, 64, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 183, 64, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
    gap: 4,
    alignSelf: 'flex-start',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  quoteText: {
    fontSize: 15,
    color: colors.foreground,
    lineHeight: 23,
    fontStyle: 'italic',
    flex: 1,
    marginVertical: 8,
  },
  quoteTextSmall: {
    fontSize: 13,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 8,
  },

  // Dot indicators
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  // Footer
  footer: {
    marginTop: 6,
    paddingHorizontal: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
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